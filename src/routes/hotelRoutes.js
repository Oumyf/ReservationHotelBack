const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotel.controller');
const upload = require('../middleware/upload');


// Route pour créer un hôtel avec upload de logo
router.post('/hotels', upload.single('logo'), hotelController.createHotel);
router.get('/hotels', hotelController.getHotels);
// Route pour mettre à jour un hôtel avec upload de logo
router.put('/hotels/:id', upload.single('logo'), hotelController.updateHotel);
router.get('/hotels/:id', hotelController.getHotelById);
router.delete('/hotels/:id', hotelController.deleteHotel);



module.exports = router;
