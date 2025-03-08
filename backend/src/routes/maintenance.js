const express = require('express');
const router = express.Router();
const {
    getAllMaintenance,
    getMaintenanceById,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance
} = require('../controllers/maintenanceController');

// Get all maintenance records
router.get('/', getAllMaintenance);

// Get single maintenance record
router.get('/:id', getMaintenanceById);

// Create new maintenance record
router.post('/', createMaintenance);

// Update maintenance record
router.patch('/:id', updateMaintenance);

// Delete maintenance record
router.delete('/:id', deleteMaintenance);

module.exports = router; 