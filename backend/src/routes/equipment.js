const express = require('express');
const router = express.Router();
const {
    getAllEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment
} = require('../controllers/equipmentController');

// Get all equipment
router.get('/', getAllEquipment);

// Get single equipment
router.get('/:id', getEquipmentById);

// Create new equipment
router.post('/', createEquipment);

// Update equipment
router.patch('/:id', updateEquipment);

// Delete equipment
router.delete('/:id', deleteEquipment);

module.exports = router; 