require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const userController = require('./controllers/userController');
const userManagementController = require('./controllers/userManagementController');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 8080;

// Enable CORS for all routes
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'https://ajackus-abuh.onrender.com'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// Initialize CORS with default settings
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ 
        status: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.post('/register', userController.registerUser);
app.post('/login', userController.loginUser);

app.get('/manageUser', authMiddleware, userManagementController.getAllUsers);
app.get('/manageUser/:id', authMiddleware, userManagementController.getUserById);
app.post('/manageUser', authMiddleware, userManagementController.manageUser);
app.patch('/manageUser/:id', authMiddleware, userManagementController.updateUser);
app.delete('/manageUser/:id', authMiddleware, userManagementController.deleteUser);

app.get('/searchQuery', authMiddleware, userManagementController.searchQuery);

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});