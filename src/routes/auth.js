const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // To generate unique ids
const User = require('../models/user');
const router = express.Router();

// Route d'inscription
router.post('/register', async (req, res) => {
    const { nom, email, password, telephone, adresse, role } = req.body;

    // Validation des entrées
    if (!nom || !email || !password || !telephone || !adresse || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Vérification si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Générer un ID unique
        const userId = uuidv4();

        // Enregistrement de l'utilisateur avec toutes les informations
        const newUser = new User({
            id: userId,
            nom,
            email,
            password: hashedPassword,
            telephone,
            adresse,
            role
        });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
    } catch (error) {
        console.error('Error during registration:', error); 
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route de connexion (login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validation des entrées
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Vérifier si le mot de passe est correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Générer un token JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET, // Utilise une clé secrète depuis les variables d'environnement
            { expiresIn: '1h' } // Le token expire dans 1 heure
        );

        // Retourner le token et l'utilisateur
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                nom: user.nom,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});


module.exports = router;
