const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');


const userSchema = new Schema({
    id: {
        type: String,
        default: uuidv4, // Génère un UUID par défaut
        unique: true,
    },
    nom: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['client', 'admin', 'hotel'],
    },
    telephone: {
        type: String,
        required: true,
    },
    adresse: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
