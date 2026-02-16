const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  icon: { 
    type: String,
    default: null 
  },
  route: { 
    type: String,
    default: null 
  },
  orderIndex: { 
    type: Number, 
    default: 0 
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    default: null
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roles'
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Menu', MenuSchema);