const express = require('express');
const router = express.Router();
const Contrat = require('../models/Contrat');
const mongoose = require('mongoose');

// CREATE
router.post('/', async (req, res) => {
  try {
    const contrat = new Contrat(req.body);
    await contrat.save();
    
    // Popule les références après création
    const contratPopulated = await Contrat.findById(contrat._id)
      .populate('id_magasin', 'nom superficie etage')
      .populate('locataire_id', 'nom email')
      .populate('status_id', 'nom couleur')
      .populate('contrat_parent_id', 'id date_debut date_fin');
    
    res.status(201).json(contratPopulated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const contrats = await Contrat.find({ deleted_at: null })
      .populate('id_magasin', 'nom superficie etage')
      .populate('locataire_id', 'nom email telephone')
      .populate('status_id', 'nom couleur')
      .populate('contrat_parent_id', 'id date_debut date_fin')
      .sort({ created_at: -1 });
    
    res.json(contrats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Read by user

router.get('/user/:userId', async (req, res) => {
  try {
    // Vérifier si userId est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: 'userId invalide' });
    }

    const contrats = await Contrat.find({
      locataire_id: new mongoose.Types.ObjectId(req.params.userId),
      deleted_at: null,
      type_contrat: { $in: ['INITIAL', 'RENOUVELLEMENT_ACTIF'] }
    })
    .populate('id_magasin', 'nom superficie etage')
    .populate('locataire_id', 'nom email telephone')
    .populate('status_id', 'nom couleur')
    .populate('contrat_parent_id', 'id date_debut date_fin');

    res.json(contrats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const contrat = await Contrat.findById(req.params.id)
      .populate('id_magasin', 'nom superficie etage prix_m2')
      .populate('locataire_id', 'nom email telephone adresse')
      .populate('status_id', 'nom couleur description')
      .populate('contrat_parent_id', 'id date_debut date_fin type_contrat');
    
    if (!contrat || contrat.deleted_at) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }
    res.json(contrat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };
    
    const contrat = await Contrat.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('id_magasin', 'nom superficie etage')
    .populate('locataire_id', 'nom email')
    .populate('status_id', 'nom couleur')
    .populate('contrat_parent_id', 'id date_debut date_fin');
    
    if (!contrat) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }
    res.json(contrat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const contrat = await Contrat.findByIdAndUpdate(
      req.params.id,
      { 
        deleted_at: new Date(),
        updated_at: new Date()
      },
      { new: true }
    );
    
    if (!contrat) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }
    res.json({ message: 'Contrat supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTES SPÉCIFIQUES POUR LES DEMANDES DE RENOUVELLEMENT

// Créer une demande de renouvellement
router.post('/:id/renouvellement', async (req, res) => {
  try {
    const contratOriginal = await Contrat.findById(req.params.id);
    
    if (!contratOriginal) {
      return res.status(404).json({ error: 'Contrat original non trouvé' });
    }
    
    // Créer la demande de renouvellement
    const demandeRenouvellement = new Contrat({
      id: `DEM-${Date.now()}`,
      id_magasin: contratOriginal.id_magasin,
      nom_magasin: contratOriginal.nom_magasin,
      locataire_id: contratOriginal.locataire_id,
      date_debut: null,
      date_fin: null,
      type_contrat: 'DEMANDE_RENOUVELLEMENT',
      contrat_parent_id: contratOriginal._id,
      statut_demande: 'EN_ATTENTE',
      status_id: req.body.status_id // Statut "EN_ATTENTE_RENOUVELLEMENT"
    });
    
    await demandeRenouvellement.save();
    
    const populated = await Contrat.findById(demandeRenouvellement._id)
      .populate('id_magasin', 'nom')
      .populate('locataire_id', 'nom')
      .populate('status_id', 'nom');
    
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Approuver une demande de renouvellement
router.patch('/:id/approuver', async (req, res) => {
  try {
    const { date_debut, date_fin } = req.body;
    
    if (!date_debut || !date_fin) {
      return res.status(400).json({ error: 'Dates de début et fin requises' });
    }
    
    const contrat = await Contrat.findByIdAndUpdate(
      req.params.id,
      {
        date_debut,
        date_fin,
        type_contrat: 'RENOUVELLEMENT_ACTIF',
        statut_demande: 'APPROUVEE',
        updated_at: new Date()
      },
      { new: true }
    )
    .populate('id_magasin', 'nom')
    .populate('locataire_id', 'nom');
    
    if (!contrat) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }
    
    res.json({ 
      message: 'Renouvellement approuvé avec succès',
      contrat 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Refuser une demande de renouvellement
router.patch('/:id/refuser', async (req, res) => {
  try {
    const contrat = await Contrat.findByIdAndUpdate(
      req.params.id,
      {
        statut_demande: 'REFUSEE',
        updated_at: new Date()
      },
      { new: true }
    );
    
    if (!contrat) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }
    
    res.json({ 
      message: 'Demande de renouvellement refusée',
      contrat 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET toutes les demandes de renouvellement en attente
router.get('/renouvellements/en-attente', async (req, res) => {
  try {
    const demandes = await Contrat.find({
      type_contrat: 'DEMANDE_RENOUVELLEMENT',
      statut_demande: 'EN_ATTENTE',
      deleted_at: null
    })
    .populate('id_magasin', 'nom superficie')
    .populate('locataire_id', 'nom email')
    .populate('contrat_parent_id', 'id date_debut date_fin')
    .sort({ created_at: -1 });
    
    res.json(demandes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET contrats expirant bientôt (pour rappels)
router.get('/expiration/prochaine', async (req, res) => {
  try {
    const dans30Jours = new Date();
    dans30Jours.setDate(dans30Jours.getDate() + 30);
    
    const contrats = await Contrat.find({
      date_fin: { $lte: dans30Jours, $gte: new Date() },
      type_contrat: { $in: ['INITIAL', 'RENOUVELLEMENT_ACTIF'] },
      deleted_at: null
    })
    .populate('id_magasin', 'nom')
    .populate('locataire_id', 'nom email')
    .sort({ date_fin: 1 });
    
    res.json(contrats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;