const Service = require('../models/service');

// Créer un service
exports.createService = async (req, res) => {
    try {
        const nouveauService = new Service(req.body);
        await nouveauService.save();
        res.status(201).json(nouveauService);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer tous les services
exports.getServices = async (req, res) => {
    try {
        const services = await Service.find().populate('avis');
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer un service par son ID
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('avis');
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }
        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un service
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un service
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
