const express = require('express');
const router = express.Router();
const Avis = require('../models/Avis');

router.post('/', async (req, res) => {
  try {
    const avis = new Avis(req.body);
    await avis.save();
    res.status(201).json(avis);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const avis = await Avis.find().populate('client_id').populate('contrat_id');
    res.json(avis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const avis = await Avis.findById(req.params.id).populate('client_id').populate('contrat_id');
    if (!avis) return res.status(404).json({ error: 'Avis non trouvé' });
    res.json(avis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const avis = await Avis.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!avis) return res.status(404).json({ error: 'Avis non trouvé' });
    res.json(avis);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const avis = await Avis.findByIdAndDelete(req.params.id);
    if (!avis) return res.status(404).json({ error: 'Avis non trouvé' });
    res.json({ message: 'Avis supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
