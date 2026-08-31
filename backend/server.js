const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const companyRoutes = require('./routes/companies');
const marksRoutes = require('./routes/marks');
const feesRoutes = require('./routes/fees');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/fees', feesRoutes);

// Basic Health Check Route
app.get('/', (req, res) => {
    res.json({ message: 'College ERP Backend API is running!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
