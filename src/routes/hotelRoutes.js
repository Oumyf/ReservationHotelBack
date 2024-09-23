const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotel.controller');

router.post('/hotels', hotelController.createHotel);
router.get('/hotels', hotelController.getHotels);
router.get('/hotels/:id', hotelController.getHotelById);
router.put('/hotels/:id', hotelController.updateHotel);
router.delete('/hotels/:id', hotelController.deleteHotel);

module.exports = router;
