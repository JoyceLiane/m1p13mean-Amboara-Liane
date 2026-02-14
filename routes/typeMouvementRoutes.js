// backend/routes/type_mouvements.js
const express = require('express');
const router = express.Router();
const TypeMouvement = require('../models/TypeMouvement');

// GET tous les types
router.get('/', async (req, res) => {
  try {
    const types = await TypeMouvement.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET un type par nom
router.get('/nom/:nom', async (req, res) => {
  try {
    const type = await TypeMouvement.findOne({ nom: req.params.nom });
    if (!type) return res.status(404).json({ error: 'Type non trouvé' });
    res.json(type);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer un type
router.post('/', async (req, res) => {
  try {
    const type = new TypeMouvement(req.body);
    await type.save();
    res.status(201).json(type);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;