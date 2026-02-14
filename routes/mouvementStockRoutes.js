const express = require('express');
const router = express.Router();
const MouvementStock = require('../models/MouvementStock');
const Produits = require('../models/Produits');

// Générer un ID unique pour le mouvement
function generateMouvementId() {
  return 'MVT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

router.post('/', async (req, res) => {
  try {
    const { user_id, produits_id, qt_entree, qt_sortie, date_mouvement, id_type } = req.body;

    const mouvementId = req.body.id || generateMouvementId();

    const mouvement = new MouvementStock({
      id: mouvementId,
      user_id,
      produits_id,
      qt_entree: qt_entree || 0,
      qt_sortie: qt_sortie || 0,
      date_mouvement: date_mouvement || new Date(),
      id_type
    });

    await mouvement.save();

    const produit = await Produits.findById(produits_id);
    if (produit) {
      const stockActuel = produit.stock || 0;
      const nouveauStock = stockActuel + (qt_entree || 0) - (qt_sortie || 0);
      
      produit.stock = Math.max(0, nouveauStock); // Éviter stock négatif
      await produit.save();
      
      console.log(`Stock mis à jour pour ${produit.nom}: ${stockActuel} → ${produit.stock}`);
    }

    const mouvementPopulated = await MouvementStock.findById(mouvement._id)
      .populate('user_id')
      .populate('produits_id')
      .populate('id_type');

    res.status(201).json(mouvementPopulated);
  } catch (err) {
    console.error('Erreur création mouvement:', err);
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const mouvements = await MouvementStock.find()
      .populate('user_id')
      .populate('produits_id')
      .populate('id_type')
      .sort({ date_mouvement: -1 });
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
    const mouvement = await MouvementStock.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('user_id').populate('produits_id').populate('id_type');
    
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