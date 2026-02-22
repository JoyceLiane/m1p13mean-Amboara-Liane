const express = require('express');
const router = express.Router();
const Users = require('../models/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const upload = require('../middleware/upload');

// ============================================
// ROUTES ADMIN - DOIVENT ÊTRE EN PREMIER !
// ============================================

// 🔥 DASHBOARD ADMIN - DOIT ÊTRE AVANT /:id
router.get('/admin/dashboard', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    console.log('📊 1. Début dashboard');
    
    const users = await Users.find()
      .select('-mdp')
      .populate('role_id')
      .populate('statut_id')
      .sort({ created_on: -1 });
    
    console.log('📊 2. Users récupérés:', users.length);
    
    const totalUsers = users.length;
    console.log('📊 3. Total calculé');
    
    const activeUsers = users.filter(u => u.statut_id?.nom === 'actif').length;
    console.log('📊 4. Actifs calculés');
    
    const inactiveUsers = users.filter(u => u.statut_id?.nom === 'inactif').length;
    console.log('📊 5. Inactifs calculés');
    
    const usersByRole = users.reduce((acc, user) => {
      const roleName = user.role_id?.nom || 'unknown';
      acc[roleName] = (acc[roleName] || 0) + 1;
      return acc;
    }, {});
    console.log('📊 6. Roles calculés');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = users.filter(u => new Date(u.created_on) >= sevenDaysAgo).length;
    console.log('📊 7. Récents calculés');
    
    console.log('📊 8. Envoi réponse');
    
    res.json({
      success: true,
      users: users,
      stats: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        recent: recentUsers,
        byRole: usersByRole
      },
      data: users
    });
    
    console.log('📊 9. ✅ Réponse envoyée');
    
  } catch (err) {
    console.error('📊 ❌ ERREUR À L\'ÉTAPE:', err);
    console.error('📊 ❌ Message:', err.message);
    console.error('📊 ❌ Stack:', err.stack);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Récupérer un utilisateur spécifique (admin)
router.get('/admin/:id', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await Users.findById(req.params.id)
      .select('-mdp')
      .populate('role_id')
      .populate('statut_id');
    
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    console.error('❌ Erreur get user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mettre à jour un utilisateur (admin)
router.put('/admin/:id', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { prenom, nom, phone, adresse, pdp, email, role_id, statut_id } = req.body;
    
    const updateData = {
      prenom,
      nom,
      phone,
      adresse,
      pdp,
      email,
      role_id,
      statut_id,
      updated_at: new Date()
    };

    // Si le mot de passe est fourni, le hasher
    if (req.body.mdp) {
      const salt = await bcrypt.genSalt(10);
      updateData.mdp = await bcrypt.hash(req.body.mdp, salt);
    }

    const user = await Users.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .select('-mdp')
      .populate('role_id')
      .populate('statut_id');

    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    console.error('❌ Erreur update user:', err);
    res.status(400).json({ error: err.message });
  }
});

// Supprimer un utilisateur (admin)
router.delete('/admin/:id', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await Users.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error('❌ Erreur delete user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Changer le statut d'un utilisateur (admin)
router.patch('/admin/:id/status', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { statut_id } = req.body;
    
    const user = await Users.findByIdAndUpdate(
      req.params.id,
      { statut_id, updated_at: new Date() },
      { new: true }
    )
      .select('-mdp')
      .populate('role_id')
      .populate('statut_id');

    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    console.error('❌ Erreur update status:', err);
    res.status(400).json({ error: err.message });
  }
});

// ============================================
// ROUTES AUTHENTIFICATION
// ============================================

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, mdp } = req.body;
    const user = await Users.findOne({ email }).populate('role_id');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(mdp, user.mdp);
    if (!isMatch) return res.status(401).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { id: user._id, role: user.role_id.nom },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role_id.nom });
  } catch (err) {
    console.error('❌ Erreur login:', err);
    res.status(500).json({ error: err.message });
  }
});

// Exemple route protégée
router.get('/admin-only', auth, authorizeRoles('admin'), (req, res) => {
  res.json({ message: "Bienvenue Admin !" });
});

// ============================================
// ROUTES PROFIL UTILISATEUR
// ============================================

// Récupérer le profil de l'utilisateur connecté
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('req.user:', req.user);

    const user = await Users.findById(req.user.id)
      .select('-mdp')
      .populate('role_id')
      .populate('statut_id');

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (err) {
    console.error('❌ Erreur get profile:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { prenom, nom, phone, adresse, pdp } = req.body;

    const updated = await Users.findByIdAndUpdate(
      req.user.id,
      {
        prenom,
        nom,
        phone,
        adresse,
        pdp,
        updated_at: new Date()
      },
      { new: true }
    )
      .select('-mdp')
      .populate('role_id')
      .populate('statut_id');

    if (!updated) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(updated);
  } catch (err) {
    console.error('❌ Erreur update profile:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', upload.single('pdp'), async (req, res) => {
  try {
    const userData = req.body;

    if (userData.mdp) {
      const saltRounds = 10; 
      userData.mdp = await bcrypt.hash(userData.mdp, saltRounds);
    }
    if (req.file) {
      userData.pdp = `${req.file.filename}`;
    }

    const user = new Users(userData);
    await user.save();

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const users = await Users.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await Users.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await Users.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;