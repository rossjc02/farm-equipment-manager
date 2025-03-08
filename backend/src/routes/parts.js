const express = require('express');
const router = express.Router();
const {
    getAllParts,
    getPartById,
    createPart,
    updatePart,
    deletePart
} = require('../controllers/partController');

// Get all parts
router.get('/', getAllParts);

// Get single part
router.get('/:id', getPartById);

// Create new part
router.post('/', createPart);

// Update part
router.patch('/:id', updatePart);

// Delete part
router.delete('/:id', deletePart);

module.exports = router; 