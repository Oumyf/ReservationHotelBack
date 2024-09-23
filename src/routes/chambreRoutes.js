const express = require('express');
const router = express.Router();
const chambreController = require('../controllers/chambre.controller');

// Routes pour les chambres
router.post('/chambres', chambreController.createChambre);
router.get('/chambres', chambreController.getChambres);
router.get('/chambres/:id', chambreController.getChambreById);
router.put('/chambres/:id', chambreController.updateChambre);
router.delete('/chambres/:id', chambreController.deleteChambre);

module.exports = router;
