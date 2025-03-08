# Farm Equipment Manager

A comprehensive web application for managing farm equipment, maintenance records, and parts inventory.

## Features

- Equipment Database
  - Track all farm equipment with detailed information
  - Store specifications, purchase dates, and current status
  - Upload and manage equipment photos and documentation

- Maintenance Tracking
  - Schedule and track regular maintenance tasks
  - Record maintenance history
  - Set up maintenance reminders and alerts

- Parts Inventory
  - Track spare parts inventory
  - Link parts to specific equipment
  - Monitor part usage and reorder levels

## Technology Stack

- Frontend:
  - React.js
  - Material-UI for styling
  - Redux for state management

- Backend:
  - Node.js with Express
  - MongoDB for database
  - JWT for authentication

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   # Frontend setup
   cd frontend
   npm install

   # Backend setup
   cd ../backend
   npm install
   ```
3. Configure environment variables
4. Start the development servers:
   ```
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd frontend
   npm start
   ```

## Project Structure

```
farm-equipment-manager/
├── frontend/           # React frontend application
├── backend/           # Node.js backend server
└── README.md         # Project documentation
``` 