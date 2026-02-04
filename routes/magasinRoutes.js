const express = require('express');
const router = express.Router();
const Magasin = require('../models/Magasin');

// CREATE
router.post('/', async (req, res) => {
  try {
    const magasin = new Magasin(req.body);
    await magasin.save();
    res.status(201).json(magasin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const magasins = await Magasin.find()
      .populate('statut_id', 'nom couleur'); // Popule le statut
    res.json(magasins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const magasin = await Magasin.findById(req.params.id)
      .populate('statut_id', 'nom couleur');
    if (!magasin) return res.status(404).json({ error: 'Magasin non trouvé' });
    res.json(magasin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    // Met à jour aussi updated_at
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };
    
    const magasin = await Magasin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('statut_id', 'nom couleur');
    
    if (!magasin) return res.status(404).json({ error: 'Magasin non trouvé' });
    res.json(magasin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const magasin = await Magasin.findByIdAndUpdate(
      req.params.id,
      { 
        deleted_at: new Date(),
        updated_at: new Date()
      },
      { new: true }
    );
    
    if (!magasin) return res.status(404).json({ error: 'Magasin non trouvé' });
    res.json({ message: 'Magasin supprimé avec succès', magasin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RESTORE (si tu veux restaurer un soft delete)
router.patch('/:id/restore', async (req, res) => {
  try {
    const magasin = await Magasin.findByIdAndUpdate(
      req.params.id,
      { 
        deleted_at: null,
        updated_at: new Date()
      },
      { new: true }
    );
    
    if (!magasin) return res.status(404).json({ error: 'Magasin non trouvé' });
    res.json({ message: 'Magasin restauré avec succès', magasin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ONLY ACTIVE (non supprimés)
router.get('/actifs/only', async (req, res) => {
  try {
    const magasins = await Magasin.find({ deleted_at: null })
      .populate('statut_id', 'nom couleur');
    res.json(magasins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;