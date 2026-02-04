const express = require('express');
const router = express.Router();
const UsersStatus = require('../models/UsersStatus');

router.post('/', async (req, res) => {
  try {
    const status = new UsersStatus(req.body);
    await status.save();
    res.status(201).json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const statuses = await UsersStatus.find();
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const status = await UsersStatus.findById(req.params.id);
    if (!status) return res.status(404).json({ error: 'Statut non trouvé' });
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const status = await UsersStatus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!status) return res.status(404).json({ error: 'Statut non trouvé' });
    res.json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const status = await UsersStatus.findByIdAndDelete(req.params.id);
    if (!status) return res.status(404).json({ error: 'Statut non trouvé' });
    res.json({ message: 'Statut supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
