const express = require('express');
const router = express.Router();
const Supermarche = require('../models/supermarche');

router.post('/', async (req, res) => {
  try {
    const supermarche = new Supermarche(req.body);
    await supermarche.save();
    res.status(201).json(supermarche);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const supermarches = await Supermarche.find().populate('id_user_admin');
    res.json(supermarches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const supermarche = await Supermarche.findById(req.params.id).populate('id_user_admin');
    if (!supermarche) return res.status(404).json({ error: 'Supermarché non trouvé' });
    res.json(supermarche);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const supermarche = await Supermarche.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supermarche) return res.status(404).json({ error: 'Supermarché non trouvé' });
    res.json(supermarche);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const supermarche = await Supermarche.findByIdAndDelete(req.params.id);
    if (!supermarche) return res.status(404).json({ error: 'Supermarché non trouvé' });
    res.json({ message: 'Supermarché supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
