const Avis = require('../models/avis');
const Service = require('../models/service');

// Créer un avis
exports.createAvis = async (req, res) => {
    try {
        const nouvelAvis = new Avis(req.body);
        await nouvelAvis.save();

        // Ajouter l'avis au service correspondant
        await Service.findByIdAndUpdate(req.body.serviceId, { $push: { avis: nouvelAvis._id } });

        res.status(201).json(nouvelAvis);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer tous les avis
exports.getAvis = async (req, res) => {
    try {
        const avis = await Avis.find();
        res.status(200).json(avis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer un avis par son ID
exports.getAvisById = async (req, res) => {
    try {
        const avis = await Avis.findById(req.params.id);
        if (!avis) {
            return res.status(404).json({ message: 'Avis non trouvé' });
        }
        res.status(200).json(avis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un avis
exports.updateAvis = async (req, res) => {
    try {
        const avis = await Avis.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!avis) {
            return res.status(404).json({ message: 'Avis non trouvé' });
        }
        res.status(200).json(avis);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un avis
exports.deleteAvis = async (req, res) => {
    try {
        const avis = await Avis.findByIdAndDelete(req.params.id);
        if (!avis) {
            return res.status(404).json({ message: 'Avis non trouvé' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
