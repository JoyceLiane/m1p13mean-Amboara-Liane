const express = require('express');
const router = express.Router();
const UrgenceMaintenance = require('../models/UrgenceMaintenance');

// CREATE
router.post('/', async (req, res) => {
  try {
    const urgence = new UrgenceMaintenance(req.body);
    await urgence.save();
    res.status(201).json(urgence);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const urgences = await UrgenceMaintenance.find()
      .sort({ delai_max_jours: 1 }); // Tri par urgence croissante
    res.json(urgences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const urgence = await UrgenceMaintenance.findById(req.params.id);
    if (!urgence) {
      return res.status(404).json({ error: 'Niveau d\'urgence non trouvé' });
    }
    res.json(urgence);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const urgence = await UrgenceMaintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!urgence) {
      return res.status(404).json({ error: 'Niveau d\'urgence non trouvé' });
    }
    res.json(urgence);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const urgence = await UrgenceMaintenance.findByIdAndDelete(req.params.id);
    
    if (!urgence) {
      return res.status(404).json({ error: 'Niveau d\'urgence non trouvé' });
    }
    res.json({ message: 'Niveau d\'urgence supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTES SPÉCIFIQUES

// Rechercher par niveau
router.get('/niveau/:niveau', async (req, res) => {
  try {
    const urgence = await UrgenceMaintenance.findOne({
      niveau: { $regex: new RegExp(`^${req.params.niveau}$`, 'i') }
    });
    
    if (!urgence) {
      return res.status(404).json({ error: 'Niveau d\'urgence non trouvé' });
    }
    res.json(urgence);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialiser les urgences par défaut
router.post('/init-par-defaut', async (req, res) => {
  try {
    const urgencesInitiales = [
      { niveau: 'FAIBLE', delai_max_jours: 30, couleur: '#008000' },
      { niveau: 'MOYENNE', delai_max_jours: 7, couleur: '#FFA500' },
      { niveau: 'ELEVEE', delai_max_jours: 3, couleur: '#FF0000' },
      { niveau: 'URGENT', delai_max_jours: 1, couleur: '#8B0000' }
    ];
    
    // Supprimer les anciennes et créer les nouvelles
    await UrgenceMaintenance.deleteMany({});
    
    const result = await UrgenceMaintenance.insertMany(urgencesInitiales);
    
    res.json({ 
      message: 'Urgences par défaut initialisées',
      count: result.length,
      urgences: result 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET urgences par délai (plus urgentes d'abord)
router.get('/tri/urgence', async (req, res) => {
  try {
    const urgences = await UrgenceMaintenance.find()
      .sort({ delai_max_jours: 1 }); // Plus petit délai = plus urgent
    res.json(urgences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vérifier si un niveau existe
router.get('/existe/:niveau', async (req, res) => {
  try {
    const existe = await UrgenceMaintenance.findOne({
      niveau: { $regex: new RegExp(`^${req.params.niveau}$`, 'i') }
    });
    res.json({ existe: !!existe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mettre à jour la couleur d'une urgence
router.patch('/:id/couleur', async (req, res) => {
  try {
    const { couleur } = req.body;
    
    if (!couleur || !couleur.startsWith('#')) {
      return res.status(400).json({ error: 'Couleur hexadécimale requise (ex: #FF0000)' });
    }
    
    const urgence = await UrgenceMaintenance.findByIdAndUpdate(
      req.params.id,
      { couleur },
      { new: true }
    );
    
    if (!urgence) {
      return res.status(404).json({ error: 'Niveau d\'urgence non trouvé' });
    }
    
    res.json({
      message: 'Couleur mise à jour',
      urgence
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET statistiques des délais
router.get('/stats/delais', async (req, res) => {
  try {
    const urgences = await UrgenceMaintenance.find();
    
    const stats = {
      total_niveaux: urgences.length,
      delai_moyen: urgences.reduce((sum, u) => sum + u.delai_max_jours, 0) / urgences.length,
      delai_min: Math.min(...urgences.map(u => u.delai_max_jours)),
      delai_max: Math.max(...urgences.map(u => u.delai_max_jours)),
      niveaux: urgences.map(u => ({
        niveau: u.niveau,
        delai: u.delai_max_jours,
        couleur: u.couleur
      }))
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;