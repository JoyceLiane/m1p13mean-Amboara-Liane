const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors'); 
require('dotenv').config(); 
const app = express(); 
const PORT = process.env.PORT || 5000; 
// Middleware 
// Middleware 
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
// Connexion à MongoDB 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.error("Erreur de connexion MongoDB:", err));
// Routes 
app.use('/users', require('./routes/usersRoutes')); 
app.use('/mouvements', require('./routes/mouvementStockRoutes'));
app.use('/types_mouvements', require('./routes/typeMouvementRoutes'));
app.use('/avis', require('./routes/avisRoutes'));
app.use('/notifications', require('./routes/notificationRoutes'));
app.use('/types-notifications', require('./routes/typeNotificationRoutes'));
app.use('/favoris', require('./routes/favorisRoutes'));
app.use('/produits', require('./routes/produitsRoutes'));
app.use('/users-status', require('./routes/usersStatusRoutes'));
app.use('/status-maintenance', require('./routes/statut-maintenance'));
app.use('/roles', require('./routes/rolesRoutes'));
app.use('/contrat', require('./routes/contratRoutes'));
app.use('/categorieProduits', require('./routes/categorieProduitsRoutes'));
app.use('/etages', require('./routes/etagesRoutes'));
app.use('/event', require('./routes/eventRoutes'));
app.use('/magasin', require('./routes/magasinRoutes'));
app.use('/maintenance', require('./routes/maintenanceRoutes'));
app.use('/paiements', require('./routes/paiementsRoutes'));
app.use('/statusContrat', require('./routes/statusContratRoutes'));
app.use('/supermarche', require('./routes/supermarcheRoutes'));
app.use('/urgenceMaintenance', require('./routes/urgenceMaintenanceRoutes'));
app.use('/menus', require('./routes/menuRoutes'));
app.use('/uploads', express.static('uploads'));
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));