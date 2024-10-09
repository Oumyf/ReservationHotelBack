// Confirm a reservation after payment and send confirmation email
const confirmReservation = async (req, res) => {
    try {
        const { reservationId, email, nom } = req.body; // L'ID de la réservation, email et nom de l'utilisateur

        if (!reservationId || !email || !nom) {
            return res.status(400).json({ message: "L'ID de réservation, l'email et le nom sont requis." });
        }

        const updatedReservation = await Reservation.findByIdAndUpdate(
            reservationId,
            { statut: 'confirmed' }, // Mettre à jour le statut à "confirmed"
            { new: true }
        );

        if (!updatedReservation) {
            return res.status(404).json({ message: "Réservation non trouvée" });
        }

        // Envoyer un email de confirmation
        let mailOptions = {
            from: 'adiaratououmyfall@gmail.com',
            to: email,
            subject: 'Confirmation de votre réservation',
            text: `Votre réservation pour ${nom} a été confirmée avec succès. Merci de choisir notre service!`,
        };

        await transporter.sendMail(mailOptions);
        
        res.status(200).json(updatedReservation);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la confirmation de la réservation", error: error.message });
    }
};
