const express = require('express');
const router = express.Router();
const Contrat = require('../models/Contrat');
const mongoose = require('mongoose');
const StatusContrat = require('../models/StatusContrat');
const { uploadMagasins} = require('../middleware/upload');
const Roles = require('../models/Roles'); // assure-toi d'importer le modèle Roles
const Users = require('../models/Users');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
// ===== DEMANDES INITIALES =====

router.get('/initiaux', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { statut_demande, recherche, page = 1, limit = 10 } = req.query;

    const query = {
      type_contrat: 'INITIAL',
      deleted_at: null
    };

    // Résoudre le statut_demande via StatusContrat
    if (statut_demande && statut_demande !== 'all') {
      const statusDoc = await StatusContrat.findOne({ nom: statut_demande });
      if (statusDoc) query.status_id = statusDoc._id;
    } else if (!statut_demande) {
      const statusEnAttente = await StatusContrat.findOne({ nom: 'EN_ATTENTE' });
      if (statusEnAttente) query.status_id = statusEnAttente._id;
    }

    let contrats = await Contrat.find(query)
      .populate({
        path: 'id_magasin',
        populate: { path: 'etage' } 
      })
      .populate('locataire_id', 'nom email telephone')
      .populate('status_id', 'nom couleur')
      .sort({ created_at: -1 });

    if (recherche) {
      const terme = recherche.toLowerCase();
      contrats = contrats.filter(c =>
        c.nom_magasin?.toLowerCase().includes(terme) ||
        c.locataire_id?.nom?.toLowerCase().includes(terme) ||
        c.locataire_id?.email?.toLowerCase().includes(terme)
      );
    }

    const total = contrats.length;
    const debut = (parseInt(page) - 1) * parseInt(limit);
    const demandes = contrats.slice(debut, debut + parseInt(limit));

    res.json({ demandes, total });
  } catch (err) {
    console.error('Erreur get initiaux:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET stats des demandes initiales
router.get('/initiaux/stats', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const base = { type_contrat: 'INITIAL' };

    const [enAttente, approuvees, refusees, total] = await Promise.all([
      Contrat.countDocuments({ ...base, statut_demande: 'EN_ATTENTE' }),
      Contrat.countDocuments({ ...base, statut_demande: 'APPROUVEE' }),
      Contrat.countDocuments({ ...base, statut_demande: 'REFUSEE' }),
      Contrat.countDocuments(base)
    ]);

    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);
    const ceMois = await Contrat.countDocuments({
      ...base,
      created_at: { $gte: debutMois }
    });

    res.json({ enAttente, approuvees, refusees, total, ceMois });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH approuver un contrat initial
router.patch('/:id/approuver-initial', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { date_debut, date_fin } = req.body;

    if (!date_debut || !date_fin) {
      return res.status(400).json({ error: 'Dates de début et fin requises' });
    }

    // 1. Récupérer le statut ACTIF
    const statusActif = await StatusContrat.findOne({ nom: 'ACTIF' });
    if (!statusActif) return res.status(500).json({ error: 'Statut ACTIF introuvable' });

    // 2. Mettre à jour le contrat : dates + status_id → ACTIF
    const contrat = await Contrat.findByIdAndUpdate(
      req.params.id,
      {
        date_debut,
        date_fin,
        status_id: statusActif._id,
        updated_at: new Date()
      },
      { new: true }
    ).populate('locataire_id');

    if (!contrat) return res.status(404).json({ error: 'Contrat non trouvé' });

    // 3. Changer le rôle du locataire → boutique
    const roleShop = await Roles.findOne({ nom: 'boutique' });
    if (!roleShop) return res.status(500).json({ error: 'Rôle boutique introuvable' });

    await Users.findByIdAndUpdate(contrat.locataire_id._id, {
      role_id: roleShop._id,
      updated_at: new Date()
    });

    res.json({ message: 'Contrat approuvé, utilisateur promu boutique', contrat });
  } catch (err) {
    console.error('Erreur approbation initial:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH refuser un contrat initial
router.patch('/:id/refuser-initial', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    // 1. Récupérer le statut REFUSEE
    const statusRefuse = await StatusContrat.findOne({ nom: 'REFUSEE' });
    if (!statusRefuse) return res.status(500).json({ error: 'Statut REFUSEE introuvable' });

    // 2. Mettre à jour le contrat : status_id → REFUSEE
    const contrat = await Contrat.findByIdAndUpdate(
      req.params.id,
      {
        status_id: statusRefuse._id,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!contrat) return res.status(404).json({ error: 'Contrat non trouvé' });

    res.json({ message: 'Demande refusée', contrat });
  } catch (err) {
    console.error('Erreur refus initial:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', uploadMagasins.single('image'), async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.imagepath = `${req.file.filename}`;
    }

    if (!data.id) {
      data.id = Date.now().toString();
    }

    const contrat = new Contrat(data);
    await contrat.save();

    res.status(201).json(contrat);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const contrat = new Contrat(req.body);
    await contrat.save();

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
  .populate({
    path: 'id_magasin',
    populate: { path: 'etage' }
  })
  .populate('locataire_id', 'nom email telephone')
  .populate('status_id', 'nom couleur')
  .populate('contrat_parent_id', 'id date_debut date_fin')
  .sort({ created_at: -1 });


    res.json(contrats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET uniquement les contrats actifs
router.get('/actifs', async (req, res) => {
  try {
    const contratsActifs = await Contrat.find({ deleted_at: null })
      .populate({
        path: 'id_magasin',
        populate: { path: 'etage' }   
      })
      .populate('locataire_id', 'nom email telephone')
      .populate('status_id', 'nom couleur')
      .populate('contrat_parent_id', 'id date_debut date_fin')
      .sort({ created_at: -1 });
    const actifs = contratsActifs.filter(c => c.status_id?.nom === 'ACTIF');

    res.json(actifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ==================== ROUTES SPÉCIFIQUES ====================

// GET toutes les demandes de renouvellement
router.get('/renouvellements', async (req, res) => {
  try {
    const { status, recherche, page = 1, limit = 10 } = req.query;

    let query = {
      type_contrat: 'DEMANDE_RENOUVELLEMENT',
      deleted_at: null
    };

    // Filtrer par statut via status_id (pas statut_demande)
    if (status && status !== 'all' && status !== 'undefined') {
      query.status_id = status; // Filtrer par l'ID du statut
    }

    if (recherche) {
      query.$or = [
        { nom_magasin: { $regex: recherche, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const demandes = await Contrat.find(query)
      .populate('id_magasin', 'nom superficie etage')
      .populate('locataire_id', 'nom email telephone')
      .populate('status_id', 'nom couleur')
      .populate('contrat_parent_id', 'id date_debut date_fin')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contrat.countDocuments(query);

    res.json({
      demandes,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET statistiques des demandes de renouvellement
router.get('/renouvellements/stats', async (req, res) => {
  try {
    // Récupérer les IDs des statuts
    const statusEnAttente = await StatusContrat.findOne({ nom: 'EN_ATTENTE' });
    const statusApprouve = await StatusContrat.findOne({ nom: 'APPROUVEE' });
    const statusRefuse = await StatusContrat.findOne({ nom: 'REFUSEE' });

    const result = {
      enAttente: 0,
      approuvees: 0,
      refusees: 0,
      total: 0,
      ceMois: 0
    };

    if (statusEnAttente) {
      result.enAttente = await Contrat.countDocuments({
        type_contrat: 'DEMANDE_RENOUVELLEMENT',
        status_id: statusEnAttente._id,
        deleted_at: null
      });
    }

    if (statusApprouve) {
      result.approuvees = await Contrat.countDocuments({
        type_contrat: 'DEMANDE_RENOUVELLEMENT',
        status_id: statusApprouve._id,
        deleted_at: null
      });
    }

    if (statusRefuse) {
      result.refusees = await Contrat.countDocuments({
        type_contrat: 'DEMANDE_RENOUVELLEMENT',
        status_id: statusRefuse._id,
        deleted_at: null
      });
    }

    result.total = result.enAttente + result.approuvees + result.refusees;

    // Demandes du mois en cours
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);

    const finMois = new Date(debutMois);
    finMois.setMonth(finMois.getMonth() + 1);

    result.ceMois = await Contrat.countDocuments({
      type_contrat: 'DEMANDE_RENOUVELLEMENT',
      created_at: { $gte: debutMois, $lt: finMois },
      deleted_at: null
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET toutes les demandes de renouvellement en attente
router.get('/renouvellements/en-attente', async (req, res) => {
  try {
    const statusEnAttente = await StatusContrat.findOne({ nom: 'EN_ATTENTE' });

    if (!statusEnAttente) {
      return res.status(500).json({ error: 'Statut EN_ATTENTE non trouvé' });
    }

    const demandes = await Contrat.find({
      type_contrat: 'DEMANDE_RENOUVELLEMENT',
      status_id: statusEnAttente._id,
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

// GET contrats par userId
router.get('/user/:userId', async (req, res) => {
  try {
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

// GET contrats par locataire
router.get('/locataire/:locataireId', async (req, res) => {
  try {
    const contrats = await Contrat.find({
      locataire_id: req.params.locataireId,
      deleted_at: null
    })
      .populate('id_magasin', 'nom superficie etage')
      .populate('status_id', 'nom couleur')
      .populate('contrat_parent_id', 'id date_debut date_fin')
      .sort({ date_fin: -1 });

    res.json(contrats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET demandes de renouvellement d'un locataire
router.get('/locataire/:locataireId/demandes-renouvellement', async (req, res) => {
  try {
    const demandes = await Contrat.find({
      locataire_id: req.params.locataireId,
      type_contrat: 'DEMANDE_RENOUVELLEMENT',
      deleted_at: null
    }).populate('contrat_parent_id', '_id');

    res.json(demandes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET contrats expirant bientôt
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

// ==================== ROUTES CRUD ====================

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

// Créer une demande de renouvellement
router.post('/:id/renouvellement', async (req, res) => {
  try {
    const contratOriginal = await Contrat.findById(req.params.id);

    if (!contratOriginal) {
      return res.status(404).json({ error: 'Contrat original non trouvé' });
    }

    // Récupérer le statut "EN_ATTENTE"
    const statusEnAttente = await StatusContrat.findOne({ nom: 'EN_ATTENTE' });

    if (!statusEnAttente) {
      return res.status(500).json({ error: 'Statut EN_ATTENTE non trouvé' });
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
      status_id: statusEnAttente._id  // Utilisation du statut EN_ATTENTE
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

    // Récupérer le statut "APPROUVEE"
    const statusApprouve = await StatusContrat.findOne({ nom: 'APPROUVEE' });

    if (!statusApprouve) {
      return res.status(500).json({ error: 'Statut APPROUVEE non trouvé' });
    }

    const contrat = await Contrat.findByIdAndUpdate(
      req.params.id,
      {
        date_debut,
        date_fin,
        type_contrat: 'RENOUVELLEMENT_ACTIF',
        status_id: statusApprouve._id,  // Mise à jour du statut
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
    // Récupérer le statut "REFUSEE"
    const statusRefuse = await StatusContrat.findOne({ nom: 'REFUSEE' });

    if (!statusRefuse) {
      return res.status(500).json({ error: 'Statut REFUSEE non trouvé' });
    }

    const contrat = await Contrat.findByIdAndUpdate(
      req.params.id,
      {
        status_id: statusRefuse._id,  // Mise à jour du statut
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

module.exports = router;