const express = require('express');
const router = express.Router();
const UsersStatus = require('../models/UsersStatus');

// CREATE
router.post('/', async (req, res) => {
  try {
    const status = new UsersStatus(req.body);
    await status.save();
    res.status(201).json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const statusList = await UsersStatus.find().sort({ id: 1 });
    res.json(statusList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const status = await UsersStatus.findOne({ 
      $or: [
        { _id: req.params.id },
        { id: req.params.id }
      ]
    });
    
    if (!status) {
      return res.status(404).json({ error: 'Statut utilisateur non trouvé' });
    }
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const status = await UsersStatus.findOneAndUpdate(
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
      return res.status(404).json({ error: 'Statut utilisateur non trouvé' });
    }
    res.json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const status = await UsersStatus.findOneAndDelete({
      $or: [
        { _id: req.params.id },
        { id: req.params.id }
      ]
    });
    
    if (!status) {
      return res.status(404).json({ error: 'Statut utilisateur non trouvé' });
    }
    res.json({ message: 'Statut utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTES SPÉCIFIQUES

// Rechercher par nom
router.get('/recherche/:nom', async (req, res) => {
  try {
    const statusList = await UsersStatus.find({
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
    const existe = await UsersStatus.findOne({ id: req.params.id });
    res.json({ existe: !!existe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialiser des statuts par défaut (pour setup)
router.post('/init-par-defaut', async (req, res) => {
  try {
    const statutsParDefaut = [
      { id: '1', nom: 'Actif' },
      { id: '2', nom: 'Inactif' },
      { id: '3', nom: 'Suspendu' },
      { id: '4', nom: 'En attente' }
    ];
    
    // Vérifier qu'ils n'existent pas déjà
    for (const statut of statutsParDefaut) {
      const existe = await UsersStatus.findOne({ id: statut.id });
      if (!existe) {
        await UsersStatus.create(statut);
      }
    }
    
    const tousStatuts = await UsersStatus.find();
    res.json({ 
      message: 'Statuts par défaut initialisés',
      statuts: tousStatuts 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;