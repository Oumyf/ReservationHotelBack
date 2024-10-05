// Middleware pour vérifier que l'utilisateur est un hôtel et propriétaire de la chambre
const verifyHotelOwnership = async (req, res, next) => {
    try {
        const chambre = await Chambre.findById(req.params.id);
        if (!chambre) {
            return res.status(404).json({ message: 'Chambre non trouvée' });
        }

        // Vérifie si l'utilisateur est un hôtel et possède la chambre
        if (req.user.role !== 'hotel' || chambre.hotelId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Accès non autorisé, vous ne pouvez pas modifier cette chambre' });
        }

        // Passe à l'étape suivante si l'utilisateur est bien le propriétaire
        next();
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};