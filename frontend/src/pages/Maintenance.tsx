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

interface MaintenanceRecord {
  _id: string;
  equipmentId: {
    _id: string;
    name: string;
    model: string;
    manufacturer: string;
  };
  type: 'Preventive' | 'Repair' | 'Inspection' | 'Oil Change' | 'Other';
  description: string;
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  cost: number;
  notes?: string;
}

interface FormData {
  equipmentId: string;
  type: string;
  description: string;
  date: string;
  status: string;
  cost: number;
  notes: string;
}

interface Equipment {
  _id: string;
  name: string;
  model: string;
  manufacturer: string;
}

const initialFormData: FormData = {
  equipmentId: '',
  type: 'Preventive',
  description: '',
  date: new Date().toISOString().split('T')[0],
  status: 'Scheduled',
  cost: 0,
  notes: ''
};

const Maintenance: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchMaintenance();
    fetchEquipment();
  }, []);

  const fetchMaintenance = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/maintenance');
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      showSnackbar('Error fetching maintenance records', 'error');
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/equipment');
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      showSnackbar('Error fetching equipment', 'error');
    }
  };

  const handleClickOpen = (record?: MaintenanceRecord) => {
    if (record) {
      setFormData({
        equipmentId: record.equipmentId._id,
        type: record.type,
        description: record.description,
        date: new Date(record.date).toISOString().split('T')[0],
        status: record.status,
        cost: record.cost,
        notes: record.notes || ''
      });
      setEditingId(record._id);
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
      [name]: name === 'cost' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async () => {
    try {
      const requiredFields = ['equipmentId', 'type', 'description', 'date', 'status', 'cost'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
      
      if (missingFields.length > 0) {
        showSnackbar(`Missing required fields: ${missingFields.join(', ')}`, 'error');
        return;
      }

      const headers = { 'Content-Type': 'application/json' };

      if (editingId) {
        const response = await axios.patch(
          `http://localhost:5000/api/maintenance/${editingId}`,
          formData,
          { headers }
        );
        console.log('Update response:', response.data);
        showSnackbar('Maintenance record updated successfully', 'success');
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/maintenance',
          formData,
          { headers }
        );
        console.log('Create response:', response.data);
        showSnackbar('Maintenance record added successfully', 'success');
      }

      handleClose();
      fetchMaintenance();
    } catch (error: any) {
      console.error('Error saving maintenance record:', error);
      let errorMessage = 'Error saving maintenance record';
      
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
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        await axios.delete(`http://localhost:5000/api/maintenance/${id}`);
        showSnackbar('Maintenance record deleted successfully', 'success');
        fetchMaintenance();
      } catch (error) {
        console.error('Error deleting maintenance record:', error);
        showSnackbar('Error deleting maintenance record', 'error');
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
        <Typography variant="h4">Maintenance Records</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleClickOpen()}
        >
          Add Maintenance Record
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Equipment</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record._id}>
                <TableCell>{`${record.equipmentId.name} (${record.equipmentId.manufacturer} ${record.equipmentId.model})`}</TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.description}</TableCell>
                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>{record.status}</TableCell>
                <TableCell>${record.cost.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => handleClickOpen(record)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(record._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Maintenance Record' : 'Add New Maintenance Record'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="equipmentId"
            label="Equipment"
            select
            fullWidth
            variant="outlined"
            value={formData.equipmentId}
            onChange={handleInputChange}
          >
            {equipment.map((item) => (
              <MenuItem key={item._id} value={item._id}>
                {`${item.name} (${item.manufacturer} ${item.model})`}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="type"
            label="Type"
            select
            fullWidth
            variant="outlined"
            value={formData.type}
            onChange={handleInputChange}
          >
            <MenuItem value="Preventive">Preventive</MenuItem>
            <MenuItem value="Repair">Repair</MenuItem>
            <MenuItem value="Inspection">Inspection</MenuItem>
            <MenuItem value="Oil Change">Oil Change</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            variant="outlined"
            value={formData.description}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="date"
            label="Date"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
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
            <MenuItem value="Scheduled">Scheduled</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            name="cost"
            label="Cost"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.cost}
            onChange={handleInputChange}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            margin="dense"
            name="notes"
            label="Notes"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={formData.notes}
            onChange={handleInputChange}
          />
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

export default Maintenance; 