const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

router.post('/', async (req, res) => {
  try {
    const notif = new Notification(req.body);
    await notif.save();
    res.status(201).json(notif);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const notifs = await Notification.find()
      .populate('emetteur_id')
      .populate('receveur_id')
      .populate('type_id');
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id)
      .populate('emetteur_id')
      .populate('receveur_id')
      .populate('type_id');
    if (!notif) return res.status(404).json({ error: 'Notification non trouvée' });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notif) return res.status(404).json({ error: 'Notification non trouvée' });
    res.json(notif);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const notif = await Notification.findByIdAndDelete(req.params.id);
    if (!notif) return res.status(404).json({ error: 'Notification non trouvée' });
    res.json({ message: 'Notification supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
