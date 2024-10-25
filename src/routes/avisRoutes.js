const express = require('express');
const router = express.Router();
const avisController = require('../controllers/avis.controller');

// Ajouter un avis (note ou commentaire) pour un hôtel
router.post('/avis', avisController.ajouterAvis);

// Récupérer les avis pour un hôtel spécifique
router.get('/avis/hotel/:hotelId', avisController.getAvisByHotel);

// Récupérer les avis d’un utilisateur spécifique
router.get('/avis/utilisateur/:userId', avisController.getAvisByUser);

// Supprimer un avis spécifique par ID
router.delete('/avis/:avisId', avisController.supprimerAvis);

// Calculer la note moyenne d'un hôtel
router.get('/avis/moyenne/:hotelId', avisController.calculerNoteMoyenne);

// Filtrer les avis d’un hôtel selon des critères (comme la note minimale)
router.get('/avis/filtrer/:hotelId', avisController.filtrerAvis);

module.exports = router;
