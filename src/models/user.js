const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
});

const User = mongoose.model('User', userSchema);

module.exports = User;
