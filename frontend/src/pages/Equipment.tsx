import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface EquipmentItem {
  _id: string;
  name: string;
  manufacturer: string;
  model: string;
  category: 'Tractor' | 'Harvester' | 'Planter' | 'Tillage' | 'Application' | 'Grain Handling';
  status: 'Active' | 'In Maintenance' | 'Out of Service' | 'Retired';
}

interface FormData {
  name: string;
  manufacturer: string;
  model: string;
  category: string;
  status: string;
}

const initialFormData: FormData = {
  name: '',
  manufacturer: '',
  model: '',
  category: 'Tractor',
  status: 'Active'
};

const Equipment: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/equipment');
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      showSnackbar('Error fetching equipment', 'error');
    }
  };

  const handleClickOpen = (item?: EquipmentItem) => {
    if (item) {
      setFormData({
        name: item.name,
        manufacturer: item.manufacturer,
        model: item.model,
        category: item.category,
        status: item.status
      });
      setEditingId(item._id);
    } else {
      setFormData(initialFormData);
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      const requiredFields = ['name', 'manufacturer', 'model', 'category', 'status'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
      
      if (missingFields.length > 0) {
        showSnackbar(`Missing required fields: ${missingFields.join(', ')}`, 'error');
        return;
      }

      const headers = { 
        'Content-Type': 'application/json'
      };

      console.log('Submitting equipment data:', formData);

      if (editingId) {
        const response = await axios.patch(
          `http://localhost:5000/api/equipment/${editingId}`, 
          formData, 
          { headers }
        );
        console.log('Update response:', response.data);
        showSnackbar('Equipment updated successfully', 'success');
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/equipment', 
          formData, 
          { headers }
        );
        console.log('Create response:', response.data);
        showSnackbar('Equipment added successfully', 'success');
      }

      handleClose();
      fetchEquipment();
    } catch (error: any) {
      console.error('Error saving equipment:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      let errorMessage = 'Error saving equipment';
      
      if (error.response?.data) {
        if (Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.join(', ');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }

      showSnackbar(errorMessage, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await axios.delete(`http://localhost:5000/api/equipment/${id}`);
        showSnackbar('Equipment deleted successfully', 'success');
        fetchEquipment();
      } catch (error) {
        console.error('Error deleting equipment:', error);
        showSnackbar('Error deleting equipment', 'error');
      }
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Equipment</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleClickOpen()}
        >
          Add Equipment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Manufacturer</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipment.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.manufacturer}</TableCell>
                <TableCell>{item.model}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => handleClickOpen(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(item._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
          />
          <TextField
            select
            margin="dense"
            name="category"
            label="Category"
            fullWidth
            variant="outlined"
            value={formData.category}
            onChange={handleInputChange}
          >
            <MenuItem value="Tractor">Tractor</MenuItem>
            <MenuItem value="Harvester">Harvester</MenuItem>
            <MenuItem value="Planter">Planter</MenuItem>
            <MenuItem value="Tillage">Tillage</MenuItem>
            <MenuItem value="Application">Application</MenuItem>
            <MenuItem value="Grain Handling">Grain Handling</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            name="manufacturer"
            label="Manufacturer"
            fullWidth
            variant="outlined"
            value={formData.manufacturer}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="model"
            label="Model"
            fullWidth
            variant="outlined"
            value={formData.model}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="status"
            label="Status"
            select
            fullWidth
            variant="outlined"
            value={formData.status}
            onChange={handleInputChange}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="In Maintenance">In Maintenance</MenuItem>
            <MenuItem value="Out of Service">Out of Service</MenuItem>
            <MenuItem value="Retired">Retired</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Equipment; 