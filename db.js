// src/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Could not connect to MongoDB:', error);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
