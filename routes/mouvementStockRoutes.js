const express = require('express');
const router = express.Router();
const MouvementStock = require('../models/MouvementStock');

router.post('/', async (req, res) => {
  try {
    const mouvement = new MouvementStock(req.body);
    await mouvement.save();
    res.status(201).json(mouvement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const mouvements = await MouvementStock.find()
      .populate('user_id')
      .populate('produits_id')
      .populate('id_type');
    res.json(mouvements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const mouvement = await MouvementStock.findById(req.params.id)
      .populate('user_id')
      .populate('produits_id')
      .populate('id_type');
    if (!mouvement) return res.status(404).json({ error: 'Mouvement non trouvé' });
    res.json(mouvement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const mouvement = await MouvementStock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mouvement) return res.status(404).json({ error: 'Mouvement non trouvé' });
    res.json(mouvement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const mouvement = await MouvementStock.findByIdAndDelete(req.params.id);
    if (!mouvement) return res.status(404).json({ error: 'Mouvement non trouvé' });
    res.json({ message: 'Mouvement supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
