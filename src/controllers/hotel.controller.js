const Hotel = require('../models/hotel.model');

// Créer un hôtel
exports.createHotel = async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir tous les hôtels
exports.getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un hôtel par ID
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hôtel non trouvé' });
    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un hôtel
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hotel) return res.status(404).json({ message: 'Hôtel non trouvé' });
    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un hôtel
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hôtel non trouvé' });
    res.status(200).json({ message: 'Hôtel supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
