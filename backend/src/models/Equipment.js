const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    manufacturer: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Tractor', 'Harvester', 'Planter', 'Tillage', 'Application', 'Grain Handling']
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'In Maintenance', 'Out of Service', 'Retired']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Equipment', equipmentSchema); 