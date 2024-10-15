const Hotel = require('../models/hotel.model');
const fs = require('fs');
const path = require('path');

// Créer un hôtel
const jwt = require('jsonwebtoken');

exports.createHotel = async (req, res) => {
  try {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decodedToken.id;

      if (!userId) {
          return res.status(400).json({ message: 'L\'ID de l\'utilisateur est requis.' });
      }

      const logo = req.file ? req.file.filename : '';

      const hotel = new Hotel({
          ...req.body,
          logo: logo,
          user: userId
      });

      await hotel.save();
      res.status(201).json(hotel);
  } catch (error) {
      console.error('Error creating hotel:', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'hôtel', error: error.message });
  }
};


// Mettre à jour un hôtel
exports.updateHotel = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hôtel non trouvé' });

    // Vérifier si l'utilisateur qui tente de mettre à jour est le propriétaire de l'hôtel
    if (hotel.user.toString() !== userId) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à mettre à jour cet hôtel.' });
    }

    // Supprimer l'ancien logo s'il existe et un nouveau est fourni
    if (req.file) {
      if (hotel.logo) {
        fs.unlinkSync(path.join(__dirname, '../uploads/', hotel.logo)); // Supprime l'ancien logo
      }
      hotel.logo = req.file.filename; // Mettre à jour avec le nouveau logo
    }

    Object.assign(hotel, req.body); // Met à jour le reste des informations
    await hotel.save();
    res.status(200).json(hotel);
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'hôtel', error: error.message });
  }
};


// Obtenir tous les hôtels
exports.getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (error) {
    console.error('Error fetching hotels:', error); // Log de l'erreur pour le serveur
    res.status(500).json({ message: 'Erreur lors de la récupération des hôtels', error: error.message });
  }
};

// Obtenir un hôtel par ID
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hôtel non trouvé' });
    res.status(200).json(hotel);
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'hôtel', error: error.message });
  }
};

// Supprimer un hôtel
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hôtel non trouvé' });

    // Supprimer le logo s'il existe
    if (hotel.logo) {
      fs.unlinkSync(path.join(__dirname, '../uploads/', hotel.logo));
    }

    await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Hôtel supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'hôtel', error: error.message });
  }
};
