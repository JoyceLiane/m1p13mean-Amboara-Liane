const express = require('express');
const router = express.Router();
const Favoris = require('../models/Favoris');

// CREATE
router.post('/', async (req, res) => {
  try {
    const favoris = new Favoris(req.body);
    await favoris.save();
    res.status(201).json(favoris);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const favoris = await Favoris.find()
      .populate('user_id')
      .populate('produits_id')
      .populate('contrat_id');
    res.json(favoris);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const favoris = await Favoris.findById(req.params.id)
      .populate('user_id')
      .populate('produits_id')
      .populate('contrat_id');
    if (!favoris) return res.status(404).json({ error: 'Favoris non trouvé' });
    res.json(favoris);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const favoris = await Favoris.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!favoris) return res.status(404).json({ error: 'Favoris non trouvé' });
    res.json(favoris);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const favoris = await Favoris.findByIdAndDelete(req.params.id);
    if (!favoris) return res.status(404).json({ error: 'Favoris non trouvé' });
    res.json({ message: 'Favoris supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
