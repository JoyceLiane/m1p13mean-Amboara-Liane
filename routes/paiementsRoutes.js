const express = require('express');
const router = express.Router();
const Paiement = require('../models/Paiement');

// CREATE
router.post('/', async (req, res) => {
  try {
    const paiement = new Paiement(req.body);
    await paiement.save();
    
    const paiementPopulated = await Paiement.findById(paiement._id)
      .populate({
        path: 'contrat_id',
        select: 'id nom_magasin date_debut date_fin',
        populate: {
          path: 'locataire_id',
          select: 'nom email'
        }
      });
    
    res.status(201).json(paiementPopulated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const paiements = await Paiement.find()
      .populate({
        path: 'contrat_id',
        select: 'id nom_magasin',
        populate: {
          path: 'locataire_id',
          select: 'nom'
        }
      })
      .sort({ date_paiement: -1 });
    
    res.json(paiements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const paiement = await Paiement.findById(req.params.id)
      .populate({
        path: 'contrat_id',
        select: 'id nom_magasin date_debut date_fin',
        populate: [
          {
            path: 'locataire_id',
            select: 'nom email telephone'
          },
          {
            path: 'id_magasin',
            select: 'nom superficie'
          }
        ]
      });
    
    if (!paiement) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }
    res.json(paiement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const paiement = await Paiement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    .populate({
      path: 'contrat_id',
      select: 'id nom_magasin',
      populate: {
        path: 'locataire_id',
        select: 'nom'
      }
    });
    
    if (!paiement) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }
    res.json(paiement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const paiement = await Paiement.findByIdAndDelete(req.params.id);
    
    if (!paiement) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }
    res.json({ message: 'Paiement supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTES SPÉCIFIQUES

// GET paiements par contrat
router.get('/contrat/:contratId', async (req, res) => {
  try {
    const paiements = await Paiement.find({
      contrat_id: req.params.contratId
    })
    .sort({ date_paiement: -1 });
    
    res.json(paiements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET paiements par mois/année
router.get('/periode/:annee/:mois', async (req, res) => {
  try {
    const annee = parseInt(req.params.annee);
    const mois = parseInt(req.params.mois) - 1; // Mois 0-indexed en JS
    
    const dateDebut = new Date(annee, mois, 1);
    const dateFin = new Date(annee, mois + 1, 0, 23, 59, 59);
    
    const paiements = await Paiement.find({
      date_paiement: {
        $gte: dateDebut,
        $lte: dateFin
      }
    })
    .populate({
      path: 'contrat_id',
      select: 'id nom_magasin',
      populate: {
        path: 'locataire_id',
        select: 'nom'
      }
    })
    .sort({ date_paiement: 1 });
    
    // Calcul du total
    const total = paiements.reduce((sum, p) => sum + p.montant, 0);
    
    res.json({
      periode: `${req.params.mois}/${req.params.annee}`,
      total,
      nombre_paiements: paiements.length,
      paiements
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET total des paiements par contrat
router.get('/contrat/:contratId/total', async (req, res) => {
  try {
    const paiements = await Paiement.find({
      contrat_id: req.params.contratId
    });
    
    const total = paiements.reduce((sum, p) => sum + p.montant, 0);
    
    res.json({
      contrat_id: req.params.contratId,
      nombre_paiements: paiements.length,
      total_paiements: total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET dernier paiement d'un contrat
router.get('/contrat/:contratId/dernier', async (req, res) => {
  try {
    const dernierPaiement = await Paiement.findOne({
      contrat_id: req.params.contratId
    })
    .sort({ date_paiement: -1 })
    .limit(1);
    
    if (!dernierPaiement) {
      return res.status(404).json({ error: 'Aucun paiement trouvé pour ce contrat' });
    }
    
    res.json(dernierPaiement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/// GET /recent?limit=5
router.get('/recent', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // par défaut 10
  try {
    const paiementsRecents = await Paiement.find()
      .populate({
        path: 'contrat_id',
        select: 'id nom_magasin',
        populate: {
          path: 'locataire_id',
          select: 'nom'
        }
      })
      .sort({ date_paiement: -1 })
      .limit(limit);

    res.json(paiementsRecents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ===== NOUVELLES ROUTES POUR PAIEMENTS MENSUELS =====

/**
 * GET /paiements/echeances/:annee/:mois
 * Récupère toutes les échéances du mois (ce qui devrait être payé)
 * Calcule pour chaque contrat actif si le paiement du mois a été effectué
 */
router.get('/echeances/:annee/:mois', async (req, res) => {
  try {
    const annee = parseInt(req.params.annee);
    const mois = parseInt(req.params.mois);
    
    // Date de début et fin du mois concerné
    const dateDebutMois = new Date(annee, mois - 1, 1);
    const dateFinMois = new Date(annee, mois, 0, 23, 59, 59);
    
    // Récupérer tous les contrats actifs pendant ce mois
    const contrats = await Contrat.find({
      date_debut: { $lte: dateFinMois },
      date_fin: { $gte: dateDebutMois }
    }).populate('locataire_id').populate('id_magasin');
    
    // Récupérer tous les paiements effectués pour ce mois
    const paiements = await Paiement.find({
      mois_concerne: {
        $gte: dateDebutMois,
        $lte: dateFinMois
      }
    }).populate({
      path: 'contrat_id',
      populate: {
        path: 'locataire_id'
      }
    });
    
    // Construire les échéances
    const aujourdhui = new Date();
    const echeances = contrats.map(contrat => {
      // Chercher si un paiement existe pour ce contrat ce mois
      const paiement = paiements.find(p => 
        p.contrat_id._id.toString() === contrat._id.toString()
      );
      
      // Date d'échéance (par exemple le 5 du mois)
      const dateEcheance = new Date(annee, mois - 1, 5);
      const estEnRetard = aujourdhui > dateEcheance && !paiement;
      
      // Montant du loyer (à prendre du contrat ou du magasin)
      const montantLoyer = contrat.montant_loyer || contrat.id_magasin?.loyer_mensuel || 0;
      
      return {
        contrat_id: contrat._id,
        contrat: {
          _id: contrat._id,
          id: contrat.id,
          nom_magasin: contrat.nom_magasin,
          date_debut: contrat.date_debut,
          date_fin: contrat.date_fin
        },
        magasin_nom: contrat.nom_magasin,
        locataire_nom: contrat.locataire_id?.nom || 'N/A',
        locataire_email: contrat.locataire_id?.email,
        mois: dateDebutMois,
        mois_string: `${mois}/${annee}`,
        montant_du: montantLoyer,
        statut: paiement ? 'payé' : (estEnRetard ? 'retard' : 'en_attente'),
        paiement: paiement || null,
        date_paiement: paiement?.date_paiement || null,
        jours_retard: estEnRetard ? Math.floor((aujourdhui - dateEcheance) / (1000 * 60 * 60 * 24)) : 0
      };
    });
    
    // Calculer les statistiques
    const stats = {
      totalAttendu: echeances.reduce((sum, e) => sum + e.montant_du, 0),
      totalPaye: echeances.filter(e => e.statut === 'payé').reduce((sum, e) => sum + e.montant_du, 0),
      totalRetard: echeances.filter(e => e.statut === 'retard').reduce((sum, e) => sum + e.montant_du, 0),
      nbPayes: echeances.filter(e => e.statut === 'payé').length,
      nbAttente: echeances.filter(e => e.statut === 'en_attente').length,
      nbRetard: echeances.filter(e => e.statut === 'retard').length
    };
    
    res.json({
      mois: `${mois}/${annee}`,
      stats,
      echeances
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /paiements/retards
 * Récupère tous les paiements en retard (mois en cours non payés après échéance)
 */
router.get('/retards', async (req, res) => {
  try {
    const aujourdhui = new Date();
    const annee = aujourdhui.getFullYear();
    const mois = aujourdhui.getMonth() + 1;
    
    // Récupérer les échéances du mois en cours
    const response = await fetch(`${req.protocol}://${req.get('host')}/paiements/echeances/${annee}/${mois}`);
    const data = await response.json();
    
    // Filtrer les retards
    const retards = data.echeances.filter(e => e.statut === 'retard');
    
    res.json(retards);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /paiements/payer-mois
 * Enregistre un paiement pour un mois spécifique
 * Body: { contrat_id, mois, montant, date_paiement }
 */
router.post('/payer-mois', async (req, res) => {
  try {
    const { contrat_id, mois, montant, date_paiement } = req.body;
    
    // Vérifier si un paiement existe déjà pour ce contrat et ce mois
    const dateDebutMois = new Date(mois);
    dateDebutMois.setDate(1);
    dateDebutMois.setHours(0, 0, 0, 0);
    
    const dateFinMois = new Date(mois);
    dateFinMois.setMonth(dateFinMois.getMonth() + 1);
    dateFinMois.setDate(0);
    dateFinMois.setHours(23, 59, 59, 999);
    
    const paiementExistant = await Paiement.findOne({
      contrat_id,
      mois_concerne: {
        $gte: dateDebutMois,
        $lte: dateFinMois
      }
    });
    
    if (paiementExistant) {
      return res.status(400).json({ 
        error: 'Un paiement existe déjà pour ce mois' 
      });
    }
    
    // Créer le nouveau paiement
    const nouveauPaiement = new Paiement({
      contrat_id,
      montant,
      date_paiement: date_paiement || new Date(),
      mois_concerne: dateDebutMois // Stocker le mois concerné
    });
    
    await nouveauPaiement.save();
    
    // Populer et retourner
    const paiementPopulated = await Paiement.findById(nouveauPaiement._id)
      .populate({
        path: 'contrat_id',
        populate: {
          path: 'locataire_id'
        }
      });
    
    res.status(201).json(paiementPopulated);
    
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /paiements/historique/:contratId
 * Récupère l'historique des paiements d'un contrat avec les mois
 */
router.get('/historique/:contratId', async (req, res) => {
  try {
    const contrat = await Contrat.findById(req.params.contratId)
      .populate('locataire_id')
      .populate('id_magasin');
    
    if (!contrat) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }
    
    // Récupérer tous les paiements du contrat
    const paiements = await Paiement.find({
      contrat_id: req.params.contratId
    }).sort({ mois_concerne: -1 });
    
    // Calculer la liste de tous les mois du contrat
    const dateDebut = new Date(contrat.date_debut);
    const dateFin = new Date(contrat.date_fin);
    const moisContrat = [];
    
    let currentDate = new Date(dateDebut);
    currentDate.setDate(1);
    
    while (currentDate <= dateFin) {
      moisContrat.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Construire l'historique complet
    const historique = moisContrat.map(mois => {
      const paiement = paiements.find(p => {
        const pMois = new Date(p.mois_concerne || p.date_paiement);
        return pMois.getMonth() === mois.getMonth() && 
               pMois.getFullYear() === mois.getFullYear();
      });
      
      return {
        mois,
        mois_string: `${mois.getMonth() + 1}/${mois.getFullYear()}`,
        montant_du: contrat.id_magasin?.loyer_mensuel || 0,
        statut: paiement ? 'payé' : 'en_attente',
        paiement: paiement || null
      };
    });
    
    res.json({
      contrat: {
        _id: contrat._id,
        nom_magasin: contrat.nom_magasin,
        locataire: contrat.locataire_id
      },
      historique
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ===== GESTION DES PAIEMENTS MULTI-MOIS =====

/**
 * POST /paiements/payer-multi-mois
 * Paiement pour plusieurs mois
 * Body: { contrat_id, nombre_mois, montant_total, date_paiement }
 */
router.post('/payer-multi-mois', async (req, res) => {
  try {
    const { contrat_id, nombre_mois, montant_total, date_paiement } = req.body;
    
    // Récupérer le contrat
    const contrat = await Contrat.findById(contrat_id).populate('id_magasin');
    if (!contrat) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }
    
    // Vérifier le montant (protéger contre les erreurs)
    const loyerMensuel = contrat.id_magasin?.loyer_mensuel || 0;
    const montantAttendu = loyerMensuel * nombre_mois;
    
    if (Math.abs(montant_total - montantAttendu) > 1) { // Tolérance de 1 FCFA
      return res.status(400).json({ 
        error: 'Montant incorrect',
        attendu: montantAttendu,
        recu: montant_total
      });
    }
    
    // Trouver les prochains mois à payer
    const dateDernierPaiement = await Paiement.findOne({ contrat_id })
      .sort({ mois_concerne_fin: -1 });
    
    let debutPeriode;
    if (dateDernierPaiement) {
      // Commencer après le dernier mois payé
      debutPeriode = new Date(dateDernierPaiement.mois_concerne_fin);
      debutPeriode.setMonth(debutPeriode.getMonth() + 1);
    } else {
      // Premier paiement : commencer à la date de début du contrat
      debutPeriode = new Date(contrat.date_debut);
      debutPeriode.setDate(1);
      debutPeriode.setHours(0, 0, 0, 0);
    }
    
    // Calculer la fin de la période
    const finPeriode = new Date(debutPeriode);
    finPeriode.setMonth(finPeriode.getMonth() + (nombre_mois - 1));
    finPeriode.setDate(1); // Premier jour du dernier mois
    finPeriode.setHours(0, 0, 0, 0);
    
    // Vérifier que ça ne dépasse pas la fin du contrat
    if (finPeriode > new Date(contrat.date_fin)) {
      return res.status(400).json({ 
        error: 'La période dépasse la fin du contrat',
        fin_contrat: contrat.date_fin,
        periode_demandee: finPeriode
      });
    }
    
    // Créer le paiement
    const nouveauPaiement = new Paiement({
      contrat_id,
      montant: montant_total,
      date_paiement: date_paiement || new Date(),
      mois_concerne_debut: debutPeriode,
      mois_concerne_fin: finPeriode,
      nombre_mois,
      montant_par_mois: loyerMensuel
    });
    
    await nouveauPaiement.save();
    
    // Populer et retourner
    const paiementPopulated = await Paiement.findById(nouveauPaiement._id)
      .populate({
        path: 'contrat_id',
        populate: [
          { path: 'locataire_id' },
          { path: 'id_magasin' }
        ]
      });
    
    res.status(201).json(paiementPopulated);
    
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /paiements/situation/:contratId
 * Récupère la situation des paiements d'un contrat
 */
router.get('/situation/:contratId', async (req, res) => {
  try {
    const contrat = await Contrat.findById(req.params.contratId)
      .populate('locataire_id')
      .populate('id_magasin');
    
    if (!contrat) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }
    
    // Récupérer tous les paiements du contrat
    const paiements = await Paiement.find({ 
      contrat_id: req.params.contratId 
    }).sort({ mois_concerne_debut: 1 });
    
    // Calculer la situation
    const loyerMensuel = contrat.id_magasin?.loyer_mensuel || 0;
    const dateDebut = new Date(contrat.date_debut);
    dateDebut.setDate(1);
    const dateFin = new Date(contrat.date_fin);
    
    let dernierMoisPaye = null;
    let totalPaye = 0;
    let moisPayes = [];
    
    if (paiements.length > 0) {
      dernierMoisPaye = paiements[paiements.length - 1].mois_concerne_fin;
      totalPaye = paiements.reduce((sum, p) => sum + p.montant, 0);
      
      // Générer la liste des mois payés
      paiements.forEach(p => {
        let current = new Date(p.mois_concerne_debut);
        while (current <= p.mois_concerne_fin) {
          moisPayes.push(new Date(current));
          current.setMonth(current.getMonth() + 1);
        }
      });
    }
    
    // Mois à venir
    const moisAVenir = [];
    const aujourdhui = new Date();
    let prochainMois = dernierMoisPaye 
      ? new Date(dernierMoisPaye) 
      : new Date(dateDebut);
    
    if (dernierMoisPaye) {
      prochainMois.setMonth(prochainMois.getMonth() + 1);
    }
    
    // Proposer les 6 prochains mois maximum
    for (let i = 0; i < 6; i++) {
      if (prochainMois <= dateFin) {
        moisAVenir.push({
          mois: new Date(prochainMois),
          montant: loyerMensuel,
          estEnRetard: prochainMois < aujourdhui
        });
        prochainMois.setMonth(prochainMois.getMonth() + 1);
      }
    }
    
    res.json({
      contrat: {
        _id: contrat._id,
        nom_magasin: contrat.nom_magasin,
        date_debut: contrat.date_debut,
        date_fin: contrat.date_fin,
        loyer_mensuel: loyerMensuel
      },
      locataire: contrat.locataire_id,
      situation: {
        total_paye: totalPaye,
        mois_payes: moisPayes,
        nombre_mois_payes: moisPayes.length,
        dernier_mois_paye: dernierMoisPaye,
        mois_a_venir: moisAVenir,
        est_a_jour: moisAVenir.length === 0 || !moisAVenir[0]?.estEnRetard
      },
      paiements
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/prochains-mois/:contratId', async (req, res) => {
  try {
    const contrat = await Contrat.findById(req.params.contratId)
      .populate('id_magasin');
    
    if (!contrat) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }
    
    // Récupérer le dernier paiement
    const dernierPaiement = await Paiement.findOne({ 
      contrat_id: req.params.contratId 
    }).sort({ mois_concerne_fin: -1 });
    
    const loyerMensuel = contrat.id_magasin?.loyer_mensuel || 0;
    const dateDebut = new Date(contrat.date_debut);
    dateDebut.setDate(1);
    const dateFin = new Date(contrat.date_fin);
    const aujourdhui = new Date();
    
    // Déterminer le prochain mois à payer
    let prochainMois;
    if (dernierPaiement) {
      prochainMois = new Date(dernierPaiement.mois_concerne_fin);
      prochainMois.setMonth(prochainMois.getMonth() + 1);
    } else {
      prochainMois = new Date(dateDebut);
    }
    
    // Générer les options de paiement (1 à 12 mois)
    const options = [];
    let moisCourant = new Date(prochainMois);
    let total = 0;
    
    for (let i = 1; i <= 12; i++) {
      if (moisCourant > dateFin) break;
      
      total += loyerMensuel;
      options.push({
        nombre_mois: i,
        montant_total: total,
        periode_debut: new Date(prochainMois),
        periode_fin: new Date(moisCourant),
        mois_concretes: `${i} mois (${moisCourant.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} inclus)`
      });
      
      moisCourant.setMonth(moisCourant.getMonth() + 1);
    }
    
    res.json({
      contrat_id: contrat._id,
      magasin_nom: contrat.nom_magasin,
      loyer_mensuel,
      prochain_mois: prochainMois,
      options
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

// GET /paiements/periode/2024/03
// → Retourne tous les paiements de mars 2024 avec total

// GET /paiements/contrat/123/total
// → Retourne le total payé pour le contrat 123

// GET /paiements/recent/5
// → Retourne les 5 derniers paiements