const express = require('express');
const router = express.Router();
//const DemandeMaintenance = require('../models/DemandeMaintenance');

// // CREATE
// router.post('/', async (req, res) => {
//   try {
//     const demande = new DemandeMaintenance(req.body);
//     await demande.save();
    
//     const demandePopulated = await DemandeMaintenance.findById(demande._id)
//       .populate('contrat_id', 'id nom_magasin')
//       .populate('urgence_id', 'niveau delai_max_jours couleur')
//       .populate('statut_id', 'nom couleur');
    
//     res.status(201).json(demandePopulated);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // READ ALL
// router.get('/', async (req, res) => {
//   try {
//     const demandes = await DemandeMaintenance.find()
//       .populate('contrat_id', 'id nom_magasin')
//       .populate({
//         path: 'contrat_id',
//         populate: {
//           path: 'locataire_id',
//           select: 'nom email telephone'
//         }
//       })
//       .populate('urgence_id', 'niveau delai_max_jours couleur')
//       .populate('statut_id', 'nom couleur')
//       .sort({ date_demande: -1 });
    
//     res.json(demandes);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // READ ONE
// router.get('/:id', async (req, res) => {
//   try {
//     const demande = await DemandeMaintenance.findById(req.params.id)
//       .populate('contrat_id', 'id nom_magasin date_debut date_fin')
//       .populate({
//         path: 'contrat_id',
//         populate: {
//           path: 'locataire_id',
//           select: 'nom email telephone adresse'
//         }
//       })
//       .populate('urgence_id', 'niveau delai_max_jours couleur description')
//       .populate('statut_id', 'nom couleur ordre');
    
//     if (!demande) {
//       return res.status(404).json({ error: 'Demande non trouvée' });
//     }
//     res.json(demande);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // UPDATE
// router.put('/:id', async (req, res) => {
//   try {
//     const demande = await DemandeMaintenance.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     )
//     .populate('contrat_id', 'id nom_magasin')
//     .populate('urgence_id', 'niveau couleur')
//     .populate('statut_id', 'nom couleur');
    
//     if (!demande) {
//       return res.status(404).json({ error: 'Demande non trouvée' });
//     }
//     res.json(demande);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // DELETE
// router.delete('/:id', async (req, res) => {
//   try {
//     const demande = await DemandeMaintenance.findByIdAndDelete(req.params.id);
    
//     if (!demande) {
//       return res.status(404).json({ error: 'Demande non trouvée' });
//     }
//     res.json({ message: 'Demande supprimée avec succès' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ROUTES SPÉCIFIQUES

// // Changer le statut d'une demande
// router.patch('/:id/statut', async (req, res) => {
//   try {
//     const { statut_id } = req.body;
    
//     if (!statut_id) {
//       return res.status(400).json({ error: 'statut_id est requis' });
//     }
    
//     const updateData = { statut_id };
    
//     // Si on passe à "TERMINEE", on peut ajouter la date d'intervention
//     if (req.body.statut_nom === 'TERMINEE' && !req.body.date_intervention) {
//       updateData.date_intervention = new Date();
//     }
    
//     const demande = await DemandeMaintenance.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     )
//     .populate('statut_id', 'nom couleur');
    
//     if (!demande) {
//       return res.status(404).json({ error: 'Demande non trouvée' });
//     }
    
//     res.json({
//       message: `Statut mis à jour: ${demande.statut_id.nom}`,
//       demande
//     });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Planifier une intervention
// router.patch('/:id/planifier', async (req, res) => {
//   try {
//     const { date_intervention, cout } = req.body;
    
//     if (!date_intervention) {
//       return res.status(400).json({ error: 'date_intervention est requise' });
//     }
    
//     const updateData = {
//       date_intervention: new Date(date_intervention)
//     };
    
//     if (cout !== undefined) {
//       updateData.cout = cout;
//     }
    
//     const demande = await DemandeMaintenance.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     )
//     .populate('statut_id', 'nom');
    
//     if (!demande) {
//       return res.status(404).json({ error: 'Demande non trouvée' });
//     }
    
//     res.json({
//       message: 'Intervention planifiée avec succès',
//       demande
//     });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // GET demandes par urgence
// router.get('/urgence/:urgenceId', async (req, res) => {
//   try {
//     const demandes = await DemandeMaintenance.find({
//       urgence_id: req.params.urgenceId
//     })
//     .populate('contrat_id', 'nom_magasin')
//     .populate('statut_id', 'nom couleur')
//     .sort({ date_demande: -1 });
    
//     res.json(demandes);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // GET demandes par statut
// router.get('/statut/:statutId', async (req, res) => {
//   try {
//     const demandes = await DemandeMaintenance.find({
//       statut_id: req.params.statutId
//     })
//     .populate('contrat_id', 'nom_magasin')
//     .populate('urgence_id', 'niveau couleur')
//     .populate({
//       path: 'contrat_id',
//       populate: {
//         path: 'locataire_id',
//         select: 'nom'
//       }
//     });
    
//     res.json(demandes);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // GET demandes urgentes (urgence élevée + en attente)
// router.get('/urgentes/en-attente', async (req, res) => {
//   try {
//     // Tu dois d'abord trouver les IDs des urgences élevées
//     // Ou mieux, passe l'ID de l'urgence "ELEVEE" en paramètre
//     const demandes = await DemandeMaintenance.find({
//       // urgence_id: { $in: idsUrgencesElevées },
//       'statut_id.nom': 'EN_ATTENTE' // À adapter selon ta structure
//     })
//     .populate('contrat_id', 'nom_magasin')
//     .populate('urgence_id', 'niveau')
//     .populate('statut_id', 'nom')
//     .sort({ date_demande: 1 })
//     .limit(20);
    
//     res.json(demandes);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // GET demandes par contrat
// router.get('/contrat/:contratId', async (req, res) => {
//   try {
//     const demandes = await DemandeMaintenance.find({
//       contrat_id: req.params.contratId
//     })
//     .populate('urgence_id', 'niveau couleur')
//     .populate('statut_id', 'nom couleur')
//     .sort({ date_demande: -1 });
    
//     res.json(demandes);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;