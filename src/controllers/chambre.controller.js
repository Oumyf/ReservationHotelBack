const Chambre = require('../models/chambre'); // Assuming you have a Chambre model
const multer = require('multer');

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

exports.upload = multer({ storage: storage });


// Create a new chambre
exports.createChambre = async (req, res) => {
  try {
    // Log les données reçues
    console.log('Received body:', req.body);
    console.log('Received file:', req.file);

    const { nom, prix } = req.body;
    if (!nom || prix <= 0) {
      return res.status(400).json({ message: 'Nom et prix valides requis.' });
    }

    const image = req.file ? req.file.path : null;

    const newChambre = new Chambre({ ...req.body, image });
    await newChambre.save();

    res.status(201).json({ message: 'Chambre créée avec succès', chambre: newChambre });
  } catch (error) {
    console.error('Erreur lors de la création de la chambre:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get all chambres
exports.getChambres = async (req, res) => {
  try {
    const chambres = await Chambre.find();
    res.status(200).json(chambres);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get a single chambre by ID
exports.getChambreById = async (req, res) => {
  try {
    const chambre = await Chambre.findById(req.params.id);
    if (!chambre) {
      return res.status(404).json({ message: 'Chambre non trouvée' });
    }
    res.status(200).json(chambre);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get all chambres by hotel ID
exports.getChambresByHotelId = async (req, res) => {
  try {
    const chambres = await Chambre.find({ hotelId: req.params.hotelId });
    res.status(200).json(chambres);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Update chambre by ID
exports.updateChambre = async (req, res) => {
  try {
    const updatedData = req.body;
    const updatedChambre = await Chambre.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!updatedChambre) {
      return res.status(404).json({ message: 'Chambre non trouvée' });
    }

    res.status(200).json({ message: 'Chambre mise à jour', chambre: updatedChambre });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Delete chambre by ID
exports.deleteChambre = async (req, res) => {
  try {
    const chambre = await Chambre.findByIdAndDelete(req.params.id);
    if (!chambre) {
      return res.status(404).json({ message: 'Chambre non trouvée' });
    }

    res.status(200).json({ message: 'Chambre supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
