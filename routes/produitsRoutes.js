const express = require('express');
const router = express.Router();
const Produits = require('../models/Produits');
const mongoose = require('mongoose');

router.post('/', async (req, res) => {
  try {
    const produit = new Produits(req.body);
    await produit.save();
    res.status(201).json(produit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const produits = await Produits.find().populate('id_categorie');
    res.json(produits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const produit = await Produits.findById(req.params.id).populate('id_categorie');
    if (!produit) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json(produit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Produits par CONTRAT (vendeur)
router.get('/contrat/:contratId', async (req, res) => {
  try {
    console.log('=== GET /produits/contrat/:contratId ===');
    console.log('contratId reçu:', req.params.contratId);
    
    const mongoose = require('mongoose');
    const contratObjectId = mongoose.Types.ObjectId.isValid(req.params.contratId) 
      ? new mongoose.Types.ObjectId(req.params.contratId)
      : req.params.contratId;
    
    const produits = await Produits.find({ id_vendeur: contratObjectId })
      .populate('id_categorie')
      .populate('id_vendeur');
    
    console.log(`✅ ${produits.length} produit(s) trouvé(s)`);
    res.json(produits);
  } catch (err) {
    console.error('❌ Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const produit = await Produits.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!produit) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json(produit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const produit = await Produits.findByIdAndDelete(req.params.id);
    if (!produit) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
