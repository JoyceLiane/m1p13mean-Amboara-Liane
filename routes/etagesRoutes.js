const express = require('express');
const router = express.Router();
const Etages = require('../models/Etages');

// CREATE
router.post('/', async (req, res) => {
  try {
    const etage = new Etages(req.body);
    await etage.save();
    res.status(201).json(etage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const etages = await Etages.find();
    res.json(etages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const etage = await Etages.findById(req.params.id);
    if (!etage) return res.status(404).json({ error: 'Étage non trouvé' });
    res.json(etage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const etage = await Etages.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!etage) return res.status(404).json({ error: 'Étage non trouvé' });
    res.json(etage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const etage = await Etages.findByIdAndDelete(req.params.id);
    if (!etage) return res.status(404).json({ error: 'Étage non trouvé' });
    res.json({ message: 'Étage supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
