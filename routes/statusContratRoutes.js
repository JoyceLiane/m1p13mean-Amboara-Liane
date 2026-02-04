const express = require('express');
const router = express.Router();
const StatusContrat = require('../models/StatusContrat');

// CREATE
router.post('/', async (req, res) => {
  try {
    const status = new StatusContrat(req.body);
    await status.save();
    res.status(201).json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const statusList = await StatusContrat.find().sort({ id: 1 });
    res.json(statusList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const status = await StatusContrat.findOne({ 
      $or: [
        { _id: req.params.id },
        { id: req.params.id }
      ]
    });
    
    if (!status) {
      return res.status(404).json({ error: 'Statut contrat non trouvé' });
    }
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const status = await StatusContrat.findOneAndUpdate(
      { 
        $or: [
          { _id: req.params.id },
          { id: req.params.id }
        ]
      },
      req.body,
      { new: true }
    );
    
    if (!status) {
      return res.status(404).json({ error: 'Statut contrat non trouvé' });
    }
    res.json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const status = await StatusContrat.findOneAndDelete({
      $or: [
        { _id: req.params.id },
        { id: req.params.id }
      ]
    });
    
    if (!status) {
      return res.status(404).json({ error: 'Statut contrat non trouvé' });
    }
    res.json({ message: 'Statut contrat supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTES SPÉCIFIQUES

// Rechercher par nom
router.get('/recherche/:nom', async (req, res) => {
  try {
    const statusList = await StatusContrat.find({
      nom: { $regex: req.params.nom, $options: 'i' }
    }).sort({ nom: 1 });
    
    res.json(statusList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vérifier si un ID existe déjà
router.get('/verifier-id/:id', async (req, res) => {
  try {
    const existe = await StatusContrat.findOne({ id: req.params.id });
    res.json({ existe: !!existe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialiser les statuts contrats par défaut
router.post('/init-par-defaut', async (req, res) => {
  try {
    const statutsParDefaut = [
      { id: '1', nom: 'Actif' },
      { id: '2', nom: 'En attente' },
      { id: '3', nom: 'En attente de renouvellement' },
      { id: '4', nom: 'Résilié' },
      { id: '5', nom: 'Expiré' },
      { id: '6', nom: 'Suspendu' }
    ];
    
    // Vérifier qu'ils n'existent pas déjà
    for (const statut of statutsParDefaut) {
      const existe = await StatusContrat.findOne({ id: statut.id });
      if (!existe) {
        await StatusContrat.create(statut);
      }
    }
    
    const tousStatuts = await StatusContrat.find();
    res.json({ 
      message: 'Statuts contrats par défaut initialisés',
      statuts: tousStatuts 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET statuts pour les demandes de renouvellement
router.get('/pour-renouvellements', async (req, res) => {
  try {
    const statuts = await StatusContrat.find({
      id: { $in: ['2', '3', '1'] }
    });
    res.json(statuts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET statuts actifs (non terminés)
router.get('/actifs', async (req, res) => {
  try {
    const statutsActifs = await StatusContrat.find({
      id: { $in: ['1', '2', '3'] }
    });
    res.json(statutsActifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET statuts terminés
router.get('/termines', async (req, res) => {
  try {
    const statutsTermines = await StatusContrat.find({
      id: { $in: ['4', '5'] }
    });
    res.json(statutsTermines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


// // Initialiser les statuts contrats
// POST /statuscontrat/init-par-defaut

// // Voir tous les statuts
// GET /statuscontrat/

// // Voir seulement les statuts pour renouvellements
// GET /statuscontrat/pour-renouvellements

// // Voir les statuts actifs
// GET /statuscontrat/actifs

// // Rechercher
// GET /statuscontrat/recherche/actif
// → Trouve "Actif"