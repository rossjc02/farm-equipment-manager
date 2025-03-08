import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Agriculture as EquipmentIcon,
  Build as MaintenanceIcon,
  Settings as PartsIcon,
  Warning as AlertIcon,
} from '@mui/icons-material';

interface DashboardStats {
  totalEquipment: number;
  pendingMaintenance: number;
  lowParts: number;
  alertsCount: number;
}

interface Equipment {
  _id: string;
  name: string;
  status: string;
}

interface Part {
  _id: string;
  name: string;
  quantity: number;
  minimumQuantity: number;
}

interface MaintenanceRecord {
  _id: string;
  equipmentName: string;
  description: string;
  status: string;
  date: string;
}

const DashboardCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <Card>
    <CardHeader
      avatar={icon}
      title={title}
    />
    <CardContent>
      <Typography variant="h4" align="center">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEquipment: 0,
    pendingMaintenance: 0,
    lowParts: 0,
    alertsCount: 0,
  });
  const [recentEquipment, setRecentEquipment] = useState<Equipment[]>([]);
  const [lowStockParts, setLowStockParts] = useState<Part[]>([]);
  const [pendingMaintenance, setPendingMaintenance] = useState<MaintenanceRecord[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch equipment data
        const equipmentResponse = await axios.get('http://localhost:5000/api/equipment');
        const equipment = equipmentResponse.data;
        
        // Fetch parts data
        const partsResponse = await axios.get('http://localhost:5000/api/parts');
        const parts = partsResponse.data;
        
        // Fetch maintenance data
        const maintenanceResponse = await axios.get('http://localhost:5000/api/maintenance');
        const maintenance = maintenanceResponse.data;

        // Calculate dashboard statistics
        const lowPartsCount = parts.filter((part: Part) => part.quantity <= part.minimumQuantity).length;
        const pendingMaintenanceCount = maintenance.filter((record: MaintenanceRecord) => 
          record.status === 'Pending' || record.status === 'In Progress'
        ).length;

        // Update stats
        setStats({
          totalEquipment: equipment.length,
          pendingMaintenance: pendingMaintenanceCount,
          lowParts: lowPartsCount,
          alertsCount: lowPartsCount + pendingMaintenanceCount, // Combined alerts
        });

        // Set recent items
        setRecentEquipment(equipment.slice(0, 5));
        setLowStockParts(parts.filter((part: Part) => part.quantity <= part.minimumQuantity).slice(0, 5));
        setPendingMaintenance(
          maintenance
            .filter((record: MaintenanceRecord) => record.status === 'Pending' || record.status === 'In Progress')
            .slice(0, 5)
        );

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Equipment"
            value={stats.totalEquipment}
            icon={<EquipmentIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Pending Maintenance"
            value={stats.pendingMaintenance}
            icon={<MaintenanceIcon color="warning" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Low Parts"
            value={stats.lowParts}
            icon={<PartsIcon color="error" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Alerts"
            value={stats.alertsCount}
            icon={<AlertIcon color="error" />}
          />
        </Grid>

        {/* Recent Activity Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Equipment
            </Typography>
            <List>
              {recentEquipment.length > 0 ? (
                recentEquipment.map((item) => (
                  <React.Fragment key={item._id}>
                    <ListItem>
                      <ListItemText
                        primary={item.name}
                        secondary={`Status: ${item.status}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No equipment found" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Parts
            </Typography>
            <List>
              {lowStockParts.length > 0 ? (
                lowStockParts.map((part) => (
                  <React.Fragment key={part._id}>
                    <ListItem>
                      <ListItemText
                        primary={part.name}
                        secondary={`Quantity: ${part.quantity} (Min: ${part.minimumQuantity})`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No low stock parts" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Pending Maintenance
            </Typography>
            <List>
              {pendingMaintenance.length > 0 ? (
                pendingMaintenance.map((record) => (
                  <React.Fragment key={record._id}>
                    <ListItem>
                      <ListItemText
                        primary={record.equipmentName}
                        secondary={`${record.description} - ${new Date(record.date).toLocaleDateString()}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No pending maintenance" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 