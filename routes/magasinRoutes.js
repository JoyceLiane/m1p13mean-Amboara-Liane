const express = require('express');
const router = express.Router();
const Magasin = require('../models/Magasin');
const upload = require('../middleware/upload');
const Contrat = require('../models/Contrat');

router.get('/disponibles', async (req, res) => {
  try {
    // 1. Récupérer tous les contrats actifs
    const contratsActifs = await Contrat.find({ deleted_at: null })
      .populate('id_magasin')
      .populate('status_id', 'nom');

    // 2. Extraire les magasins occupés
    const magasinsOccupes = contratsActifs
      .filter(c => c.status_id?.nom === 'ACTIF')
      .map(c => c.id_magasin?._id?.toString());

    // 3. Récupérer tous les magasins non supprimés
    const tousMagasins = await Magasin.find({ deleted_at: null }).populate('etage');

    // 4. Filtrer ceux qui ne sont pas occupés
    const magasinsDisponibles = tousMagasins.filter(m => !magasinsOccupes.includes(m._id.toString()));

    res.json(magasinsDisponibles);
  } catch (err) {
    console.error('Erreur récupération magasins disponibles:', err);
    res.status(500).json({ error: err.message });
  }
});


// READ ALL
router.get('/', async (req, res) => {
  try {
    const magasins = await Magasin.find()
      .populate('statut_id', 'nom couleur'); // Popule le statut
    res.json(magasins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const magasin = await Magasin.findById(req.params.id)
      .populate('statut_id', 'nom couleur');
    if (!magasin) return res.status(404).json({ error: 'Magasin non trouvé' });
    res.json(magasin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    // Met à jour aussi updated_at
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };
    
    const magasin = await Magasin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('statut_id', 'nom couleur');
    
    if (!magasin) return res.status(404).json({ error: 'Magasin non trouvé' });
    res.json(magasin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const magasin = await Magasin.findByIdAndUpdate(
      req.params.id,
      { 
        deleted_at: new Date(),
        updated_at: new Date()
      },
      { new: true }
    );
    
    if (!magasin) return res.status(404).json({ error: 'Magasin non trouvé' });
    res.json({ message: 'Magasin supprimé avec succès', magasin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RESTORE (si tu veux restaurer un soft delete)
router.patch('/:id/restore', async (req, res) => {
  try {
    const magasin = await Magasin.findByIdAndUpdate(
      req.params.id,
      { 
        deleted_at: null,
        updated_at: new Date()
      },
      { new: true }
    );
    
    if (!magasin) return res.status(404).json({ error: 'Magasin non trouvé' });
    res.json({ message: 'Magasin restauré avec succès', magasin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ONLY ACTIVE (non supprimés)
router.get('/actifs/only', async (req, res) => {
  try {
    const magasins = await Magasin.find({ deleted_at: null })
      .populate('statut_id', 'nom couleur');
    res.json(magasins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;