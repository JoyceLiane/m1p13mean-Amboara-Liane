const express = require('express');
const router = express.Router();
const Produits = require('../models/Produits');
const mongoose = require('mongoose');
const MouvementStock = require('../models/MouvementStock');
const Contrat = require('../models/Contrat');
const path = require('path');
const { uploadProduits } = require('../middleware/upload');

router.post('/', uploadProduits.single('image'), async (req, res) => {
  try {
    const data = req.body;

    // Gestion de l'image produit
    if (req.file) {
      data.imagepath =  req.file.filename;
    }

    const produit = new Produits(data);
    await produit.save();

    res.status(201).json(produit);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Fonction helper pour calculer le stock d'un produit
async function calculerStockProduit(produitId) {
  const mouvements = await MouvementStock.find({ produits_id: produitId });

  const stock = mouvements.reduce((total, mouv) => {
    return total + (mouv.qt_entree || 0) - (mouv.qt_sortie || 0);
  }, 0);

  return Math.max(0, stock); // Éviter stock négatif
}

// Fonction helper pour calculer le stock d'un produit
async function calculerStockProduit(produitId) {
  const mouvements = await MouvementStock.find({ produits_id: produitId });

  const stock = mouvements.reduce((total, mouv) => {
    return total + (mouv.qt_entree || 0) - (mouv.qt_sortie || 0);
  }, 0);

  return Math.max(0, stock); // Éviter stock négatif
}

// GET tous les produits avec stock calculé et mis à jour
router.get('/', async (req, res) => {
  try {
    const produits = await Produits.find().populate('id_categorie');

    // Calculer le stock pour chaque produit et mettre à jour en BDD
    const produitsAvecStock = await Promise.all(
      produits.map(async (produit) => {
        const stockCalcule = await calculerStockProduit(produit._id);

        // Mettre à jour le stock en base de données
        produit.stock = stockCalcule;
        await produit.save();

        return produit.toObject();
      })
    );

    res.json(produitsAvecStock);
  } catch (err) {
    console.error('Erreur lors du calcul des stocks:', err);
    res.status(500).json({ error: err.message });
  }
});
// GET produits liés uniquement aux contrats actifs
router.get('/actifs', async (req, res) => {
  try {
    const contratsActifs = await Contrat.find({ deleted_at: null })
      .populate('status_id', 'nom');

    const actifsIds = contratsActifs
      .filter(c => c.status_id?.nom === 'ACTIF')
      .map(c => c._id);

    const produits = await Produits.find({ id_vendeur: { $in: actifsIds } })
      .populate('id_categorie')
      .populate('id_vendeur');

    res.json(produits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const produit = await Produits.findById(req.params.id).populate('id_categorie');
    if (!produit) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json(produit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Produits par CONTRAT (vendeur)
router.get('/contrat/:contratId', async (req, res) => {
  try {
    console.log('=== GET /produits/contrat/:contratId ===');
    console.log('contratId reçu:', req.params.contratId);

    const mongoose = require('mongoose');
    const contratObjectId = mongoose.Types.ObjectId.isValid(req.params.contratId)
      ? new mongoose.Types.ObjectId(req.params.contratId)
      : req.params.contratId;

    const produits = await Produits.find({ id_vendeur: contratObjectId })
      .populate('id_categorie')
      .populate('id_vendeur');

    console.log(`✅ ${produits.length} produit(s) trouvé(s)`);
    res.json(produits);
  } catch (err) {
    console.error('❌ Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const produit = await Produits.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!produit) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json(produit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const produit = await Produits.findByIdAndDelete(req.params.id);
    if (!produit) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
