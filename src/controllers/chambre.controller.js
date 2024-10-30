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


// exports.createChambre = async (req, res) => {
//   try {
//       const userId = req.user.id; // Récupère l'ID de l'utilisateur authentifié
//       const chambreData = {
//           ...req.body,
//           hotelId: userId, // Lie la chambre à l'hôtel (utilisateur)
//       };

//       const nouvelleChambre = await Chambre.create(chambreData);
//       res.status(201).json(nouvelleChambre);
//   } catch (error) {
//       res.status(500).json({ message: 'Erreur lors de la création de la chambre.', error: error.message });
//   }
// };


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

exports.updateChambre = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body; // Cela contient les données mises à jour

  try {
      // Récupérez la chambre existante
      const chambre = await Chambre.findById(id);
      if (!chambre) {
          return res.status(404).send({ message: 'Chambre non trouvée' });
      }

      // Si une nouvelle image a été téléchargée, mettez à jour l'image
      if (req.file) {
          updatedData.image = req.file.path; // Mettez à jour l'image
      } else {
          updatedData.image = chambre.image; // Conservez l'image existante
      }

      // Mettez à jour la chambre
      const updatedChambre = await Chambre.findByIdAndUpdate(id, updatedData, { new: true });
      res.send(updatedChambre);
  } catch (error) {
      res.status(500).send({ message: 'Erreur lors de la mise à jour de la chambre', error });
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

// Search chambres based on availability, price, capacity, and type
exports.searchChambres = async (req, res) => {
  try {
    const { disponibilite, minPrix, maxPrix, nombreDePersonnes } = req.query;

    const filter = {};
    if (disponibilite) filter.disponibilite = disponibilite === 'true';
    if (minPrix) filter.prix = { ...filter.prix, $gte: parseFloat(minPrix) };
    if (maxPrix) filter.prix = { ...filter.prix, $lte: parseFloat(maxPrix) };
    if (nombreDePersonnes) filter.nombreDePersonnes = { $gte: parseInt(nombreDePersonnes) };

    const chambres = await Chambre.find(filter);
    res.status(200).json(chambres);
  } catch (error) {
    console.error('Erreur lors de la recherche des chambres:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


