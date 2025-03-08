const Equipment = require('../models/Equipment');
const { validationResult } = require('express-validator');

// Get all equipment
const getAllEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.find({});
        res.json(equipment);
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ message: 'Error fetching equipment' });
    }
};

// Get single equipment by ID
const getEquipmentById = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        
        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }
        
        res.json(equipment);
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ message: 'Error fetching equipment' });
    }
};

// Create new equipment
const createEquipment = async (req, res) => {
    try {
        console.log('Creating equipment with data:', req.body);

        // Validate required fields
        const requiredFields = ['name', 'manufacturer', 'model', 'category', 'status'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const equipment = new Equipment(req.body);
        
        const savedEquipment = await equipment.save();
        console.log('Equipment saved successfully:', savedEquipment);
        res.status(201).json(savedEquipment);
    } catch (error) {
        console.error('Error creating equipment:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Error creating equipment', error: error.message });
    }
};

// Update equipment
const updateEquipment = async (req, res) => {
    try {
        console.log('Updating equipment with data:', req.body);
        console.log('Equipment ID:', req.params.id);

        const equipment = await Equipment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }
        
        console.log('Equipment updated successfully:', equipment);
        res.json(equipment);
    } catch (error) {
        console.error('Error updating equipment:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Error updating equipment', error: error.message });
    }
};

// Delete equipment
const deleteEquipment = async (req, res) => {
    try {
        console.log('Deleting equipment:', req.params.id);

        const equipment = await Equipment.findByIdAndDelete(req.params.id);
        
        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }
        
        console.log('Equipment deleted successfully');
        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({ message: 'Error deleting equipment', error: error.message });
    }
};

// Add document to equipment
exports.addDocument = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (!equipment) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        equipment.documents.push({
            name: req.file.originalname,
            path: req.file.path
        });

        await equipment.save();
        res.json({
            message: 'Document added successfully',
            document: equipment.documents[equipment.documents.length - 1]
        });
    } catch (error) {
        res.status(500).json({ error: 'Error adding document' });
    }
};

// Add image to equipment
exports.addImage = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (!equipment) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        equipment.images.push({
            name: req.file.originalname,
            path: req.file.path
        });

        await equipment.save();
        res.json({
            message: 'Image added successfully',
            image: equipment.images[equipment.images.length - 1]
        });
    } catch (error) {
        res.status(500).json({ error: 'Error adding image' });
    }
};

module.exports = {
    getAllEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment
}; 