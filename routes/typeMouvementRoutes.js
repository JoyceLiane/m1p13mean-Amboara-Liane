const express = require('express');
const router = express.Router();
const TypeMouvement = require('../models/TypeMouvement');

router.post('/', async (req, res) => {
  try {
    const type = new TypeMouvement(req.body);
    await type.save();
    res.status(201).json(type);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const types = await TypeMouvement.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const type = await TypeMouvement.findById(req.params.id);
    if (!type) return res.status(404).json({ error: 'Type de mouvement non trouvé' });
    res.json(type);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const type = await TypeMouvement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!type) return res.status(404).json({ error: 'Type de mouvement non trouvé' });
    res.json(type);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const type = await TypeMouvement.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ error: 'Type de mouvement non trouvé' });
    res.json({ message: 'Type de mouvement supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
