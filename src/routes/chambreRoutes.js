const express = require('express');
const router = express.Router();
const chambreController = require('../controllers/chambre.controller');

// Routes pour les chambres// Route pour la recherche des chambres
router.get('/chambres/search', chambreController.searchChambres);

router.post('/chambres', chambreController.upload.single('image'), chambreController.createChambre);
router.get('/chambres', chambreController.getChambres);
router.get('/chambres/:id', chambreController.getChambreById);
router.get('/hotels/:hotelId/chambres', chambreController.getChambresByHotelId);
router.put('/chambres/:id', chambreController.upload.single('image'), chambreController.updateChambre);
router.delete('/chambres/:id', chambreController.deleteChambre);


module.exports = router;


