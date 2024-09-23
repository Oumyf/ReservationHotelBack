const Chambre = require('../models/chambre'); // Assurez-vous d'importer le modèle de chambre

// Créer une nouvelle chambre
exports.createChambre = async (req, res) => {
    try {
        const nouvelleChambre = new Chambre(req.body);
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
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
