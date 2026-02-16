const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// GET - Récupérer tous les menus (organisés hiérarchiquement)
router.get('/', auth, async (req, res) => {
  try {
    // Récupérer tous les menus
    const menus = await Menu.find().sort('orderIndex').lean();
    
    // Organiser les menus en hiérarchie
    const menuMap = {};
    const rootMenus = [];
    
    menus.forEach(menu => {
      menu.children = [];
      menuMap[menu._id] = menu;
    });
    
    menus.forEach(menu => {
      if (menu.parent && menuMap[menu.parent]) {
        menuMap[menu.parent].children.push(menu);
      } else {
        rootMenus.push(menu);
      }
    });
    
    res.json(rootMenus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Récupérer les menus accessibles par le rôle de l'utilisateur
router.get('/user', auth, async (req, res) => {
  try {
    // Récupérer tous les menus
    const menus = await Menu.find().sort('orderIndex').lean();
    
    // Filtrer les menus accessibles par le rôle de l'utilisateur
    const userRole = req.user.role; // L'ID du rôle de l'utilisateur connecté
    
    const filterMenusByRole = (menuList) => {
      return menuList
        .filter(menu => {
          // Garder le menu si aucun rôle requis OU si l'utilisateur a le rôle
          return menu.roles.length === 0 || menu.roles.includes(userRole);
        })
        .map(menu => ({ ...menu }));
    };
    
    // Organiser et filtrer hiérarchiquement
    const menuMap = {};
    const rootMenus = [];
    
    menus.forEach(menu => {
      menu.children = [];
      menuMap[menu._id] = menu;
    });
    
    menus.forEach(menu => {
      if (menu.parent && menuMap[menu.parent]) {
        // Vérifier si le parent est accessible
        const parentAccessible = menuMap[menu.parent].roles.length === 0 || 
                                 menuMap[menu.parent].roles.includes(userRole);
        
        // Vérifier si l'enfant est accessible
        const childAccessible = menu.roles.length === 0 || 
                               menu.roles.includes(userRole);
        
        if (parentAccessible && childAccessible) {
          menuMap[menu.parent].children.push(menu);
        }
      } else {
        // Menu racine
        const accessible = menu.roles.length === 0 || menu.roles.includes(userRole);
        if (accessible) {
          rootMenus.push(menu);
        }
      }
    });
    
    res.json(rootMenus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Récupérer les menus par rôle spécifique (admin seulement)
router.get('/role/:roleId', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { roleId } = req.params;
    
    const menus = await Menu.find({
      roles: roleId
    }).sort('orderIndex');
    
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Créer un nouveau menu
router.post('/', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { title, icon, route, orderIndex, parent, roles } = req.body;
    
    const menu = new Menu({
      title,
      icon,
      route,
      orderIndex,
      parent: parent || null,
      roles: roles || []
    });
    
    await menu.save();
    res.status(201).json(menu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT - Mettre à jour un menu
router.put('/:id', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!menu) {
      return res.status(404).json({ error: 'Menu non trouvé' });
    }
    
    res.json(menu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Supprimer un menu
router.delete('/:id', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    
    if (!menu) {
      return res.status(404).json({ error: 'Menu non trouvé' });
    }
    
    // Supprimer le menu et ses enfants
    await Menu.deleteMany({ parent: menu._id });
    await menu.deleteOne();
    
    res.json({ message: 'Menu supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Assigner des rôles à un menu
router.put('/:id/roles', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { roles } = req.body;
    
    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      { roles },
      { new: true }
    );
    
    if (!menu) {
      return res.status(404).json({ error: 'Menu non trouvé' });
    }
    
    res.json(menu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;