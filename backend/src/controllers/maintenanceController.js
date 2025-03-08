const Maintenance = require('../models/Maintenance');
const Equipment = require('../models/Equipment');
const Part = require('../models/Part');
const { validationResult } = require('express-validator');

// Get all maintenance records
const getAllMaintenance = async (req, res) => {
    try {
        const maintenance = await Maintenance.find({})
            .populate('equipmentId', 'name model manufacturer');
        res.json(maintenance);
    } catch (error) {
        console.error('Error fetching maintenance records:', error);
        res.status(500).json({ message: 'Error fetching maintenance records' });
    }
};

// Get single maintenance record by ID
const getMaintenanceById = async (req, res) => {
    try {
        const maintenance = await Maintenance.findById(req.params.id)
            .populate('equipmentId', 'name model manufacturer');
        
        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        
        res.json(maintenance);
    } catch (error) {
        console.error('Error fetching maintenance record:', error);
        res.status(500).json({ message: 'Error fetching maintenance record' });
    }
};

// Create new maintenance record
const createMaintenance = async (req, res) => {
    try {
        console.log('Creating maintenance record with data:', req.body);

        // Validate required fields
        const requiredFields = ['equipmentId', 'type', 'description', 'date', 'status', 'cost'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Verify that the equipment exists
        const equipment = await Equipment.findById(req.body.equipmentId);
        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        const maintenance = new Maintenance(req.body);
        const savedMaintenance = await maintenance.save();
        
        // Populate equipment details before sending response
        const populatedMaintenance = await Maintenance.findById(savedMaintenance._id)
            .populate('equipmentId', 'name model manufacturer');

        console.log('Maintenance record saved successfully:', populatedMaintenance);
        res.status(201).json(populatedMaintenance);
    } catch (error) {
        console.error('Error creating maintenance record:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Error creating maintenance record', error: error.message });
    }
};

// Update maintenance record
const updateMaintenance = async (req, res) => {
    try {
        console.log('Updating maintenance record with data:', req.body);
        console.log('Maintenance ID:', req.params.id);

        const maintenance = await Maintenance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('equipmentId', 'name model manufacturer');
        
        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        
        console.log('Maintenance record updated successfully:', maintenance);
        res.json(maintenance);
    } catch (error) {
        console.error('Error updating maintenance record:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Error updating maintenance record', error: error.message });
    }
};

// Delete maintenance record
const deleteMaintenance = async (req, res) => {
    try {
        console.log('Deleting maintenance record:', req.params.id);

        const maintenance = await Maintenance.findByIdAndDelete(req.params.id);
        
        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        
        console.log('Maintenance record deleted successfully');
        res.json({ message: 'Maintenance record deleted successfully' });
    } catch (error) {
        console.error('Error deleting maintenance record:', error);
        res.status(500).json({ message: 'Error deleting maintenance record', error: error.message });
    }
};

// Add document to maintenance record
exports.addDocument = async (req, res) => {
    try {
        const maintenance = await Maintenance.findById(req.params.id);
        if (!maintenance) {
            return res.status(404).json({ error: 'Maintenance record not found' });
        }

        maintenance.documents.push({
            name: req.file.originalname,
            path: req.file.path
        });

        await maintenance.save();
        res.json({
            message: 'Document added successfully',
            document: maintenance.documents[maintenance.documents.length - 1]
        });
    } catch (error) {
        res.status(500).json({ error: 'Error adding document' });
    }
};

module.exports = {
    getAllMaintenance,
    getMaintenanceById,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance
}; 