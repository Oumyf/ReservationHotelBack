const Chambre = require('../models/chambre');
const multer = require('multer');
const path = require('path');

// Configuration de multer pour le téléversement des images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Dossier où les images seront stockées
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Renommer le fichier avec un timestamp
    }
});

const upload = multer({ storage });

// Créer une nouvelle chambre
exports.createChambre = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Image est requise' });
    }

    try {
        const nouvelleChambre = new Chambre({
            nom: req.body.nom,
            type: req.body.type,
            prix: req.body.prix,
            description: req.body.description,
            disponibilite: req.body.disponibilite,
            hotelId: req.body.hotelId,
            image: req.file.path, // Enregistrer le chemin de l'image
            nombreDePersonnes: req.body.nombreDePersonnes, // Nombre de personnes
        });
        await nouvelleChambre.save();
        res.status(201).json(nouvelleChambre);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer toutes les chambres
exports.getChambres = async (req, res) => {
    try {
        const chambres = await Chambre.find();
        res.status(200).json(chambres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer une chambre par son ID
exports.getChambreById = async (req, res) => {
    try {
        const chambre = await Chambre.findById(req.params.id);
        if (!chambre) {
            return res.status(404).json({ message: 'Chambre non trouvée' });
        }
        res.status(200).json(chambre);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer les chambres d'un hôtel spécifique
exports.getChambresByHotelId = async (req, res) => {
    try {
        const chambres = await Chambre.find({ hotelId: req.params.hotelId });
        res.status(200).json(chambres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour une chambre
exports.updateChambre = async (req, res) => {
    try {
        const chambre = await Chambre.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!chambre) {
            return res.status(404).json({ message: 'Chambre non trouvée' });
        }
        res.status(200).json(chambre);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer une chambre
exports.deleteChambre = async (req, res) => {
    try {
        const chambre = await Chambre.findByIdAndDelete(req.params.id);
        if (!chambre) {
            return res.status(404).json({ message: 'Chambre non trouvée' });
        }
        res.status(204).send(); // No content response for successful deletion
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Exporter le middleware multer pour l'utiliser dans les routes
module.exports.upload = upload;
