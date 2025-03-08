const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    partNumber: {
        type: String,
        required: true,
        trim: true
    },
    manufacturer: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    minimumQuantity: {
        type: Number,
        required: true,
        min: 0,
        default: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Engine', 'Transmission', 'Electrical', 'Hydraulic', 'Body', 'Other'],
        default: 'Other'
    }
}, {
    timestamps: true
});

// Create index for faster searches
partSchema.index({ name: 'text', partNumber: 'text', manufacturer: 'text' });

// Add a virtual for checking if reorder is needed
partSchema.virtual('needsReorder').get(function() {
    return this.quantity <= this.minimumQuantity;
});

const Part = mongoose.model('Part', partSchema);

module.exports = Part; 