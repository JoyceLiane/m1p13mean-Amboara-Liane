const express = require('express');
const router = express.Router();
const CategorieProduits = require('../models/Categorie_produits');

// CREATE
router.post('/', async (req, res) => {
  try {
    const categorie = new CategorieProduits(req.body);
    await categorie.save();
    res.status(201).json(categorie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const categories = await CategorieProduits.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const categorie = await CategorieProduits.findById(req.params.id);
    if (!categorie) return res.status(404).json({ error: 'Catégorie non trouvée' });
    res.json(categorie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const categorie = await CategorieProduits.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!categorie) return res.status(404).json({ error: 'Catégorie non trouvée' });
    res.json(categorie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const categorie = await CategorieProduits.findByIdAndDelete(req.params.id);
    if (!categorie) return res.status(404).json({ error: 'Catégorie non trouvée' });
    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
