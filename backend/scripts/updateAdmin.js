require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

const updateAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm-equipment-manager');
        
        // Find admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('Admin user not found');
            process.exit(0);
        }

        // Update admin credentials
        adminUser.username = 'rossjc';
        adminUser.password = 'Redwagon96';

        // Save changes
        await adminUser.save();
        
        console.log('Admin credentials updated successfully');
        console.log('New username: rossjc');
        console.log('New password: Redwagon96');
        
    } catch (error) {
        console.error('Error updating admin credentials:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

updateAdminUser(); 