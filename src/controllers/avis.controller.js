const Avis = require('../models/avis');
const Note = require('../models/note');
const Commentaire = require('../models/commentaire');
const Reservation = require('../models/reservations'); // Modèle de réservation
const Hotel = require('../models/hotel.model');

// Fonction pour vérifier si l'utilisateur a réservé une chambre dans l'hôtel
async function verifierReservation(userId, hotelId) {
    return await Reservation.findOne({
      user_id: userId,
      hotel_id: hotelId,
      statut: "confirmée"
    });
  }
  

// Fonction pour ajouter un avis (note ou commentaire)
exports.ajouterAvis = async (req, res) => {
    try {
        const { type, hotelId, auteur, contenu, note } = req.body;

        // Vérifier si l'utilisateur a réservé une chambre dans cet hôtel
        const aReserve = await verifierReservation(auteur, hotelId);
        if (!aReserve) {
            return res.status(403).json({ message: 'Vous devez avoir réservé une chambre dans cet hôtel pour laisser un avis.' });
        }

        let nouvelAvis;
        if (type === 'note') {
            // Ajouter une note
            nouvelAvis = new Note({ hotelId, auteur, note });
        } else if (type === 'commentaire') {
            // Ajouter un commentaire
            nouvelAvis = new Commentaire({ hotelId, auteur, contenu });
        } else {
            return res.status(400).json({ message: 'Type d\'avis invalide. Utilisez "note" ou "commentaire".' });
        }

        // Sauvegarder l'avis
        await nouvelAvis.save();
        res.status(201).json({ message: 'Avis ajouté avec succès!', avis: nouvelAvis });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'avis.', error: error.message });
    }
};

// Fonction pour récupérer les avis d'un hôtel
exports.getAvisByHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const avis = await Avis.find({ hotelId }).populate('hotelId');

        if (!avis) {
            return res.status(404).json({ message: 'Aucun avis trouvé pour cet hôtel.' });
        }

        res.status(200).json(avis);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des avis.', error: error.message });
    }
};

// Fonction pour supprimer un avis
exports.supprimerAvis = async (req, res) => {
    try {
        const { avisId } = req.params;

        const avis = await Avis.findByIdAndDelete(avisId);
        if (!avis) {
            return res.status(404).json({ message: 'Avis non trouvé.' });
        }

        res.status(200).json({ message: 'Avis supprimé avec succès!' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'avis.', error: error.message });
    }
};

// Fonction pour calculer la note moyenne d'un hôtel
exports.calculerNoteMoyenne = async (req, res) => {
    try {
        const { hotelId } = req.params;

        const notes = await Note.find({ hotelId });

        if (notes.length === 0) {
            return res.status(404).json({ message: 'Pas encore de notes pour cet hôtel.' });
        }

        const sommeNotes = notes.reduce((total, avis) => total + avis.note, 0);
        const moyenne = sommeNotes / notes.length;

        res.status(200).json({ hotelId, moyenne });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du calcul de la note moyenne.', error: error.message });
    }
};

// Fonction pour filtrer les avis
exports.filtrerAvis = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { minNote } = req.query;

        let filter = { hotelId };
        if (minNote) {
            filter.note = { $gte: minNote };
        }

        const avisFiltres = await Avis.find(filter).populate('hotelId');

        if (!avisFiltres.length) {
            return res.status(404).json({ message: 'Aucun avis ne correspond aux critères.' });
        }

        res.status(200).json(avisFiltres);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du filtrage des avis.', error: error.message });
    }
};

// Fonction pour récupérer les avis d'un utilisateur
exports.getAvisByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const avis = await Avis.find({ auteur: userId });

        if (!avis.length) {
            return res.status(404).json({ message: 'Aucun avis trouvé pour cet utilisateur.' });
        }

        res.status(200).json(avis);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des avis.', error: error.message });
    }
};
