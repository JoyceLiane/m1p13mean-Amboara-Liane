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


module.exports = router;

// GET /paiements/periode/2024/03
// → Retourne tous les paiements de mars 2024 avec total

// GET /paiements/contrat/123/total
// → Retourne le total payé pour le contrat 123

// GET /paiements/recent/5
// → Retourne les 5 derniers paiements