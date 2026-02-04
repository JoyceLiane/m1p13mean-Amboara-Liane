const express = require('express');
const router = express.Router();
const TypeNotification = require('../models/TypeNotification');

router.post('/', async (req, res) => {
  try {
    const typeNotif = new TypeNotification(req.body);
    await typeNotif.save();
    res.status(201).json(typeNotif);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const types = await TypeNotification.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const typeNotif = await TypeNotification.findById(req.params.id);
    if (!typeNotif) return res.status(404).json({ error: 'Type de notification non trouvé' });
    res.json(typeNotif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const typeNotif = await TypeNotification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!typeNotif) return res.status(404).json({ error: 'Type de notification non trouvé' });
    res.json(typeNotif);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const typeNotif = await TypeNotification.findByIdAndDelete(req.params.id);
    if (!typeNotif) return res.status(404).json({ error: 'Type de notification non trouvé' });
    res.json({ message: 'Type de notification supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
