const express = require('express');
const router = express.Router();
const Roles = require('../models/Roles');

// CREATE
router.post('/', async (req, res) => {
  try {
    const role = new Roles(req.body);
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const roles = await Roles.find().sort({ id: 1 });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const role = await Roles.findOne({ 
      $or: [
        { _id: req.params.id },
        { id: req.params.id }
      ]
    });
    
    if (!role) {
      return res.status(404).json({ error: 'Rôle non trouvé' });
    }
    res.json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const role = await Roles.findOneAndUpdate(
      { 
        $or: [
          { _id: req.params.id },
          { id: req.params.id }
        ]
      },
      req.body,
      { new: true }
    );
    
    if (!role) {
      return res.status(404).json({ error: 'Rôle non trouvé' });
    }
    res.json(role);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const role = await Roles.findOneAndDelete({
      $or: [
        { _id: req.params.id },
        { id: req.params.id }
      ]
    });
    
    if (!role) {
      return res.status(404).json({ error: 'Rôle non trouvé' });
    }
    res.json({ message: 'Rôle supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTES SPÉCIFIQUES

// Rechercher par nom
router.get('/recherche/:nom', async (req, res) => {
  try {
    const roles = await Roles.find({
      nom: { $regex: req.params.nom, $options: 'i' }
    }).sort({ nom: 1 });
    
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vérifier si un ID existe déjà
router.get('/verifier-id/:id', async (req, res) => {
  try {
    const existe = await Roles.findOne({ id: req.params.id });
    res.json({ existe: !!existe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialiser les rôles par défaut
router.post('/init-par-defaut', async (req, res) => {
  try {
    const rolesParDefaut = [
      { id: '1', nom: 'Admin' },
      { id: '2', nom: 'Locataire' },
      { id: '3', nom: 'Client' }
    ];
    
    // Vérifier qu'ils n'existent pas déjà
    for (const role of rolesParDefaut) {
      const existe = await Roles.findOne({ id: role.id });
      if (!existe) {
        await Roles.create(role);
      }
    }
    
    const tousRoles = await Roles.find();
    res.json({ 
      message: 'Rôles par défaut initialisés',
      roles: tousRoles 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET rôles pour les utilisateurs (exclure certains rôles si besoin)
router.get('/pour-utilisateurs', async (req, res) => {
  try {
    const roles = await Roles.find({
      id: { $in: ['1','2', '3'] }
    });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET rôles pour le staff admin
router.get('/pour-staff', async (req, res) => {
  try {
    const roles = await Roles.find({
      id: { $in: ['1','2', '3'] }
    });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;