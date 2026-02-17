const express = require('express');
const router = express.Router();
const StatusMaintenance = require('../models/StatusMaintenance');

// CREATE
router.post('/', async (req, res) => {
  try {
    const status = new StatusMaintenance(req.body);
    await status.save();
    res.status(201).json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const statusList = await StatusMaintenance.find().sort({ ordre: 1 });
    res.json(statusList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const status = await StatusMaintenance.findById(req.params.id);
    if (!status) {
      return res.status(404).json({ error: 'Statut non trouvé' });
    }
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const status = await StatusMaintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!status) {
      return res.status(404).json({ error: 'Statut non trouvé' });
    }
    res.json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const status = await StatusMaintenance.findByIdAndDelete(req.params.id);
    
    if (!status) {
      return res.status(404).json({ error: 'Statut non trouvé' });
    }
    res.json({ message: 'Statut supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;