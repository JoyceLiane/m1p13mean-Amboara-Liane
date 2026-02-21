// backend/routes/shop-statistics.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const MouvementStock = require('../models/MouvementStock');
const Produits = require('../models/Produits');
const TypeMouvement = require('../models/TypeMouvement');

// Helper: Obtenir le type "vente"
async function getTypeMouvementVente() {
  const typeVente = await TypeMouvement.findOne({ nom: { $regex: /vente/i } });
  return typeVente ? typeVente._id : null;
}

// GET /api/shop-statistics/:contratId - Statistiques générales
router.get('/:contratId', async (req, res) => {
  try {
    const { contratId } = req.params;

    // console.log('📊 Récupération stats pour contrat:', contratId);

    const typeMouvementVenteId = await getTypeMouvementVente();
    console.log('🔍 Type vente trouvé:', typeMouvementVenteId);

    if (!typeMouvementVenteId) {
      console.log('⚠️ Aucun type "vente" trouvé');
      return res.json({
        totalVentes: 0,
        totalRevenu: 0,
        ventesAujourdhui: 0,
        revenusAujourdhui: 0,
        ventesSemaine: 0,
        revenusSemaine: 0,
        ventesMois: 0,
        revenusMois: 0
      });
    }

    // Récupérer tous les produits du contrat
    const produits = await Produits.find({ id_vendeur: contratId });
    const produitsIds = produits.map(p => p._id);

    console.log(`📦 ${produits.length} produits trouvés pour ce contrat`);

    if (produitsIds.length === 0) {
      console.log('⚠️ Aucun produit pour ce contrat');
      return res.json({
        totalVentes: 0,
        totalRevenu: 0,
        ventesAujourdhui: 0,
        revenusAujourdhui: 0,
        ventesSemaine: 0,
        revenusSemaine: 0,
        ventesMois: 0,
        revenusMois: 0
      });
    }

    // Toutes les ventes (qt_sortie avec type vente)
    const ventes = await MouvementStock.find({
      produits_id: { $in: produitsIds },
      id_type: typeMouvementVenteId,
      qt_sortie: { $gt: 0 }
    }).populate('produits_id');

    console.log(`💰 ${ventes.length} ventes trouvées`);

    // ✅ Dates corrigées - Ne pas modifier l'objet maintenant
    const maintenant = new Date();
    const debutJour = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate(), 0, 0, 0, 0);

    const debutSemaine = new Date(maintenant);
    debutSemaine.setDate(maintenant.getDate() - maintenant.getDay());
    debutSemaine.setHours(0, 0, 0, 0);

    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1, 0, 0, 0, 0);

    console.log('📅 Période aujourd\'hui depuis:', debutJour.toISOString());
    console.log('📅 Période semaine depuis:', debutSemaine.toISOString());
    console.log('📅 Période mois depuis:', debutMois.toISOString());

    // Calculs
    let totalVentes = 0;
    let totalRevenu = 0;
    let ventesAujourdhui = 0;
    let revenusAujourdhui = 0;
    let ventesSemaine = 0;
    let revenusSemaine = 0;
    let ventesMois = 0;
    let revenusMois = 0;

    ventes.forEach(vente => {
      const quantite = vente.qt_sortie;
      const prix = Number(vente.produits_id?.prix) || 0;  
      const revenu = quantite * prix;
      const dateVente = new Date(vente.date_mouvement);

      totalVentes += quantite;
      totalRevenu += revenu;

      if (dateVente >= debutJour) {
        ventesAujourdhui += quantite;
        revenusAujourdhui += revenu;
      }

      if (dateVente >= debutSemaine) {
        ventesSemaine += quantite;
        revenusSemaine += revenu;
      }

      if (dateVente >= debutMois) {
        ventesMois += quantite;
        revenusMois += revenu;
      }
    });

    const stats = {
      totalVentes,
      totalRevenu,
      ventesAujourdhui,
      revenusAujourdhui,
      ventesSemaine,
      revenusSemaine,
      ventesMois,
      revenusMois
    };

    console.log('✅ Stats calculées:', stats);
    res.json(stats);

  } catch (error) {
    console.error('❌ Erreur stats générales:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/shop-statistics/:contratId/top-produits - Top produits vendus
router.get('/:contratId/top-produits', async (req, res) => {
  try {
    const { contratId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    console.log(`🌟 Top ${limit} produits pour contrat:`, contratId);

    const typeMouvementVenteId = await getTypeMouvementVente();

    if (!typeMouvementVenteId) {
      console.log('⚠️ Aucun type "vente" trouvé');
      return res.json([]);
    }

    // Récupérer tous les produits du contrat
    const produits = await Produits.find({ id_vendeur: contratId });
    const produitsIds = produits.map(p => p._id);

    if (produitsIds.length === 0) {
      console.log('⚠️ Aucun produit pour ce contrat');
      return res.json([]);
    }

    // Agréger les ventes par produit
    const ventes = await MouvementStock.find({
      produits_id: { $in: produitsIds },
      id_type: typeMouvementVenteId,
      qt_sortie: { $gt: 0 }
    }).populate('produits_id');

    console.log(`💰 ${ventes.length} ventes trouvées pour top produits`);

    // Grouper par produit
    const produitsMap = new Map();

    ventes.forEach(vente => {
      if (!vente.produits_id) {
        console.warn('⚠️ Vente sans produit:', vente._id);
        return;
      }

      const produitId = vente.produits_id._id.toString();
      const quantite = vente.qt_sortie;
      const prix = vente.produits_id.prix || 0;

      if (!produitsMap.has(produitId)) {
        produitsMap.set(produitId, {
          _id: vente.produits_id._id,
          nom: vente.produits_id.nom,
          imagepath: vente.produits_id.imagepath,
          totalVendu: 0,
          revenu: 0
        });
      }

      const produit = produitsMap.get(produitId);
      produit.totalVendu += quantite;
      produit.revenu += quantite * prix;
    });

    // Trier et limiter
    const topProduits = Array.from(produitsMap.values())
      .sort((a, b) => b.totalVendu - a.totalVendu)
      .slice(0, limit);

    console.log(`✅ Top ${topProduits.length} produits retournés`);
    res.json(topProduits);

  } catch (error) {
    console.error('❌ Erreur top produits:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/shop-statistics/:contratId/ventes-recentes - Ventes récentes
router.get('/:contratId/ventes-recentes', async (req, res) => {
  try {
    const { contratId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    console.log(`🕒 ${limit} ventes récentes pour contrat:`, contratId);

    const typeMouvementVenteId = await getTypeMouvementVente();

    if (!typeMouvementVenteId) {
      console.log('⚠️ Aucun type "vente" trouvé');
      return res.json([]);
    }

    // Récupérer tous les produits du contrat
    const produits = await Produits.find({ id_vendeur: contratId });
    const produitsIds = produits.map(p => p._id);

    if (produitsIds.length === 0) {
      console.log('⚠️ Aucun produit pour ce contrat');
      return res.json([]);
    }

    // Ventes récentes
    const ventes = await MouvementStock.find({
      produits_id: { $in: produitsIds },
      id_type: typeMouvementVenteId,
      qt_sortie: { $gt: 0 }
    })
      .populate('produits_id')
      .populate('user_id', 'nom prenom')
      .sort({ date_mouvement: -1 })
      .limit(limit);

    console.log(`💰 ${ventes.length} ventes récentes trouvées`);

    const ventesFormatted = ventes
      .filter(vente => vente.produits_id)
      .map(vente => ({
        _id: vente._id,
        produit: {
          _id: vente.produits_id._id,
          nom: vente.produits_id.nom,
          prix_vente: vente.produits_id.prix || 0
        },
        quantite: vente.qt_sortie,
        date_mouvement: vente.date_mouvement,
        user: vente.user_id ? {
          _id: vente.user_id._id,
          nom: vente.user_id.nom || '',
          prenom: vente.user_id.prenom || ''
        } : null
      }));

    console.log(`✅ ${ventesFormatted.length} ventes formatées retournées`);
    res.json(ventesFormatted);

  } catch (error) {
    console.error('❌ Erreur ventes récentes:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/shop-statistics/:contratId/revenus-par-jour - Revenus des X derniers jours
router.get('/:contratId/revenus-par-jour', async (req, res) => {
  try {
    const { contratId } = req.params;
    const jours = parseInt(req.query.jours) || 7;

    console.log(`📈 Revenus des ${jours} derniers jours pour contrat:`, contratId);

    const typeMouvementVenteId = await getTypeMouvementVente();

    if (!typeMouvementVenteId) {
      console.log('⚠️ Aucun type "vente" trouvé');
      return res.json([]);
    }

    // Récupérer tous les produits du contrat
    const produits = await Produits.find({ id_vendeur: contratId });
    const produitsIds = produits.map(p => p._id);

    if (produitsIds.length === 0) {
      console.log('⚠️ Aucun produit pour ce contrat');
      return res.json([]);
    }

    // Date de début
    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - jours);
    dateDebut.setHours(0, 0, 0, 0);

    console.log('📅 Recherche ventes depuis:', dateDebut.toISOString());

    // Ventes depuis dateDebut
    const ventes = await MouvementStock.find({
      produits_id: { $in: produitsIds },
      id_type: typeMouvementVenteId,
      qt_sortie: { $gt: 0 },
      date_mouvement: { $gte: dateDebut }
    }).populate('produits_id');

    console.log(`💰 ${ventes.length} ventes trouvées dans la période`);

    // Grouper par jour
    const revenusMap = new Map();

    // Initialiser tous les jours
    for (let i = 0; i < jours; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      revenusMap.set(dateStr, { date: dateStr, revenu: 0, ventes: 0 });
    }

    // Ajouter les revenus
    ventes.forEach(vente => {
      if (!vente.produits_id) {
        console.warn('⚠️ Vente sans produit:', vente._id);
        return;
      }

      const dateStr = new Date(vente.date_mouvement).toISOString().split('T')[0];
      if (revenusMap.has(dateStr)) {
        const jour = revenusMap.get(dateStr);
        jour.revenu += vente.qt_sortie * (vente.produits_id.prix || 0);
        jour.ventes += vente.qt_sortie;
      }
    });

    // Convertir en array et trier par date croissante
    const revenus = Array.from(revenusMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log(`✅ Revenus par jour calculés:`, revenus.length, 'jours');
    res.json(revenus);

  } catch (error) {
    console.error('❌ Erreur revenus par jour:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;