const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  emetteur_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  receveur_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  date: { type: Date, default: Date.now },
  type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TypeNotification', required: true }
}, { timestamps: false });

module.exports = mongoose.model('Notification', NotificationSchema);
