require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const userController = require('./controllers/userController');
const userManagementController = require('./controllers/userManagementController');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 8080;

// app.use(cors({
//     origin: 'http://localhost:3000' || 'https://ajackus-one-theta.vercel.app',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

// const corsOptions = {
//     origin: 'http://localhost:3000' || 'https://ajackus-one-theta.vercel.app',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     optionsSuccessStatus: 204,
//  };
 
//  app.use(cors(corsOptions));

const allowedOrigins = [
    'http://localhost:3000',
    'https://ajackus-one-theta.vercel.app'
  ];
  
  const corsOptions = {
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    optionsSuccessStatus: 204
  };
  app.use(cors(corsOptions));



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