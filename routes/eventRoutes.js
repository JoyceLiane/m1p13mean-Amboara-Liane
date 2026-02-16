const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// CREATE
router.post('/', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    
    const eventPopulated = await Event.findById(event._id)
      .populate('created_by', 'nom email');
    
    res.status(201).json(eventPopulated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('created_by', 'nom email')
      .sort({ date_debut: 1 });
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  console.time(`🔍 getEvent-${req.params.id}`);
  try {
    const event = await Event.findById(req.params.id)
      .populate('created_by', 'nom email');
    
    console.timeEnd(`🔍 getEvent-${req.params.id}`);
    
    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    res.json(event);
  } catch (err) {
    console.timeEnd(`🔍 getEvent-${req.params.id}`);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    .populate('created_by', 'nom');
    
    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    res.json({ message: 'Événement supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTES SPÉCIFIQUES

// Changer le statut d'un événement
router.patch('/:id/statut', async (req, res) => {
  try {
    const { statut } = req.body;
    
    const statutsValides = ['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    )
    .populate('created_by', 'nom');
    
    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    
    res.json({
      message: `Statut mis à jour: ${statut}`,
      event
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET événements à venir
router.get('/a-venir', async (req, res) => {
  try {
    const aujourdhui = new Date();
    
    const events = await Event.find({
      date_debut: { $gte: aujourdhui },
      statut: { $in: ['PLANIFIE', 'EN_COURS'] }
    })
    .populate('created_by', 'nom')
    .sort({ date_debut: 1 })
    .limit(20);
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET événements en cours
router.get('/en-cours', async (req, res) => {
  try {
    const aujourdhui = new Date();
    
    const events = await Event.find({
      date_debut: { $lte: aujourdhui },
      date_fin: { $gte: aujourdhui },
      statut: { $in: ['PLANIFIE', 'EN_COURS'] }
    })
    .populate('created_by', 'nom')
    .sort({ date_debut: 1 });
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET événements par période
router.get('/periode/:debut/:fin', async (req, res) => {
  try {
    const dateDebut = new Date(req.params.debut);
    const dateFin = new Date(req.params.fin);
    
    const events = await Event.find({
      date_debut: { $gte: dateDebut, $lte: dateFin }
    })
    .populate('created_by', 'nom')
    .sort({ date_debut: 1 });
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET événements par statut
router.get('/statut/:statut', async (req, res) => {
  try {
    const statutsValides = ['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE'];
    if (!statutsValides.includes(req.params.statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    
    const events = await Event.find({ 
      statut: req.params.statut 
    })
    .populate('created_by', 'nom')
    .sort({ date_debut: -1 });
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET événements coûteux (seuil paramétrable)
router.get('/cout/sup/:seuil', async (req, res) => {
  try {
    const seuil = parseFloat(req.params.seuil);
    
    if (isNaN(seuil)) {
      return res.status(400).json({ error: 'Seuil invalide' });
    }
    
    const events = await Event.find({
      cout: { $gt: seuil }
    })
    .populate('created_by', 'nom')
    .sort({ cout: -1 });
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET événements d'un utilisateur
router.get('/utilisateur/:userId', async (req, res) => {
  try {
    const events = await Event.find({
      created_by: req.params.userId
    })
    .populate('created_by', 'nom email')
    .sort({ date_creation: -1 });
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET statistiques événements
router.get('/stats/mensuelles/:annee/:mois', async (req, res) => {
  try {
    const annee = parseInt(req.params.annee);
    const mois = parseInt(req.params.mois) - 1;
    
    const dateDebut = new Date(annee, mois, 1);
    const dateFin = new Date(annee, mois + 1, 0, 23, 59, 59);
    
    const events = await Event.find({
      date_debut: { $gte: dateDebut, $lte: dateFin }
    });
    
    const stats = {
      total: events.length,
      par_statut: {
        PLANIFIE: events.filter(e => e.statut === 'PLANIFIE').length,
        EN_COURS: events.filter(e => e.statut === 'EN_COURS').length,
        TERMINE: events.filter(e => e.statut === 'TERMINE').length,
        ANNULE: events.filter(e => e.statut === 'ANNULE').length
      },
      cout_total: events.reduce((sum, e) => sum + e.cout, 0),
      cout_moyen: events.length > 0 ? 
        events.reduce((sum, e) => sum + e.cout, 0) / events.length : 0
    };
    
    res.json({
      periode: `${req.params.mois}/${req.params.annee}`,
      ...stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


// GET /events/a-venir
// → Événements futurs pour calendrier

// GET /events/en-cours
// → Événements en cours aujourd'hui

// GET /events/periode/2024-03-01/2024-03-31
// → Événements de mars 2024

// GET /events/cout/sup/1000
// → Événements coûtant plus de 1000€

// GET /events/stats/mensuelles/2024/03
// → Statistiques mars 2024