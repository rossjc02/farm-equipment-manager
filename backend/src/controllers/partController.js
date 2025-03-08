const Part = require('../models/Part');

// Get all parts
const getAllParts = async (req, res) => {
    try {
        const parts = await Part.find({});
        res.json(parts);
    } catch (error) {
        console.error('Error fetching parts:', error);
        res.status(500).json({ message: 'Error fetching parts' });
    }
};

// Get single part by ID
const getPartById = async (req, res) => {
    try {
        const part = await Part.findById(req.params.id);
        
        if (!part) {
            return res.status(404).json({ message: 'Part not found' });
        }
        
        res.json(part);
    } catch (error) {
        console.error('Error fetching part:', error);
        res.status(500).json({ message: 'Error fetching part' });
    }
};

// Create new part
const createPart = async (req, res) => {
    try {
        console.log('Creating part with data:', req.body);

        // Validate required fields
        const requiredFields = ['name', 'partNumber', 'manufacturer', 'quantity', 'minimumQuantity', 'price', 'location', 'category'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const part = new Part(req.body);
        const savedPart = await part.save();
        
        console.log('Part saved successfully:', savedPart);
        res.status(201).json(savedPart);
    } catch (error) {
        console.error('Error creating part:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Error creating part', error: error.message });
    }
};

// Update part
const updatePart = async (req, res) => {
    try {
        console.log('Updating part with data:', req.body);
        console.log('Part ID:', req.params.id);

        const part = await Part.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!part) {
            return res.status(404).json({ message: 'Part not found' });
        }
        
        console.log('Part updated successfully:', part);
        res.json(part);
    } catch (error) {
        console.error('Error updating part:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Error updating part', error: error.message });
    }
};

// Delete part
const deletePart = async (req, res) => {
    try {
        console.log('Deleting part:', req.params.id);

        const part = await Part.findByIdAndDelete(req.params.id);
        
        if (!part) {
            return res.status(404).json({ message: 'Part not found' });
        }
        
        console.log('Part deleted successfully');
        res.json({ message: 'Part deleted successfully' });
    } catch (error) {
        console.error('Error deleting part:', error);
        res.status(500).json({ message: 'Error deleting part', error: error.message });
    }
};

module.exports = {
    getAllParts,
    getPartById,
    createPart,
    updatePart,
    deletePart
}; 