import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    MenuItem,
    Alert
} from '@mui/material';

interface Part {
    _id: string;
    name: string;
    partNumber: string;
    manufacturer: string;
    quantity: number;
    minimumQuantity: number;
    price: number;
    location: string;
    description: string;
    category: string;
}

interface FormData {
    name: string;
    partNumber: string;
    manufacturer: string;
    quantity: number;
    minimumQuantity: number;
    price: number;
    location: string;
    description: string;
    category: string;
}

const initialFormData: FormData = {
    name: '',
    partNumber: '',
    manufacturer: '',
    quantity: 0,
    minimumQuantity: 0,
    price: 0,
    location: '',
    description: '',
    category: ''
};

const Parts: React.FC = () => {
    const [parts, setParts] = useState<Part[]>([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    const fetchParts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/parts');
            setParts(response.data);
        } catch (error) {
            console.error('Error fetching parts:', error);
            setSnackbar({
                open: true,
                message: 'Error fetching parts',
                severity: 'error'
            });
        }
    };

    useEffect(() => {
        fetchParts();
    }, []);

    const handleClose = () => {
        setOpen(false);
        setFormData(initialFormData);
        setEditingId(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' || name === 'minimumQuantity' || name === 'price'
                ? parseFloat(value) || 0
                : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const requiredFields = ['name', 'partNumber', 'manufacturer', 'quantity', 'minimumQuantity', 'price', 'location', 'category'];
            const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);

            if (missingFields.length > 0) {
                setSnackbar({
                    open: true,
                    message: `Missing required fields: ${missingFields.join(', ')}`,
                    severity: 'error'
                });
                return;
            }

            if (editingId) {
                await axios.patch(`http://localhost:5000/api/parts/${editingId}`, formData);
                setSnackbar({
                    open: true,
                    message: 'Part updated successfully',
                    severity: 'success'
                });
            } else {
                await axios.post('http://localhost:5000/api/parts', formData);
                setSnackbar({
                    open: true,
                    message: 'Part added successfully',
                    severity: 'success'
                });
            }

            handleClose();
            fetchParts();
        } catch (error: any) {
            console.error('Error saving part:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error saving part';
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const handleEdit = (part: Part) => {
        setFormData({
            name: part.name,
            partNumber: part.partNumber,
            manufacturer: part.manufacturer,
            quantity: part.quantity,
            minimumQuantity: part.minimumQuantity,
            price: part.price,
            location: part.location,
            description: part.description || '',
            category: part.category
        });
        setEditingId(part._id);
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`http://localhost:5000/api/parts/${id}`);
            setSnackbar({
                open: true,
                message: 'Part deleted successfully',
                severity: 'success'
            });
            fetchParts();
        } catch (error) {
            console.error('Error deleting part:', error);
            setSnackbar({
                open: true,
                message: 'Error deleting part',
                severity: 'error'
            });
        }
    };

    const categories = [
        'Engine',
        'Transmission',
        'Electrical',
        'Hydraulic',
        'Mechanical',
        'Body',
        'Other'
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Parts Inventory</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>
                    Add New Part
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Part Number</TableCell>
                            <TableCell>Manufacturer</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Min. Quantity</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {parts.map((part) => (
                            <TableRow 
                                key={part._id}
                                sx={{
                                    backgroundColor: part.quantity <= part.minimumQuantity ? '#fff3e0' : 'inherit'
                                }}
                            >
                                <TableCell>{part.name}</TableCell>
                                <TableCell>{part.partNumber}</TableCell>
                                <TableCell>{part.manufacturer}</TableCell>
                                <TableCell>{part.category}</TableCell>
                                <TableCell>{part.quantity}</TableCell>
                                <TableCell>{part.minimumQuantity}</TableCell>
                                <TableCell>${part.price.toFixed(2)}</TableCell>
                                <TableCell>{part.location}</TableCell>
                                <TableCell>
                                    <Button size="small" onClick={() => handleEdit(part)}>Edit</Button>
                                    <Button size="small" color="error" onClick={() => handleDelete(part._id)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{editingId ? 'Edit Part' : 'Add New Part'}</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }} noValidate>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Part Number"
                            name="partNumber"
                            value={formData.partNumber}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Manufacturer"
                            name="manufacturer"
                            value={formData.manufacturer}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            select
                            fullWidth
                            margin="normal"
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                        >
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Quantity"
                            name="quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Minimum Quantity"
                            name="minimumQuantity"
                            type="number"
                            value={formData.minimumQuantity}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            multiline
                            rows={3}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingId ? 'Update' : 'Add'} Part
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Parts; 