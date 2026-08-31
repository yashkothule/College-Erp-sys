const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { id, name, email, password, role, program, semester, academic_year } = req.body;
    
    try {
        // Simple check if user exists
        const [existing] = await db.query('SELECT * FROM users WHERE email = ? OR id = ?', [email, id]);
        if (existing.length > 0) {
            return res.status(400).json({ status: 400, message: 'User with this ID or Email already exists' });
        }
        
        // Status is 'pending' for newly registered users, requires admin approval
        const status = role === 'admin' ? 'active' : 'pending'; 

        const query = `INSERT INTO users (id, name, email, password, role, program, semester, academic_year, status) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await db.query(query, [id, name, email, password, role, program || null, semester || null, academic_year || null, status]);
        
        res.status(201).json({ status: 201, message: 'Registration successful. Pending admin approval.' });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { id, password } = req.body; // frontend uses roll number/id and password
    try {
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(401).json({ status: 401, message: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Plain text comparison for prototype
        if (user.password !== password) {
            return res.status(401).json({ status: 401, message: 'Invalid credentials' });
        }
        
        if (user.status !== 'active') {
            return res.status(403).json({ status: 403, message: 'Account is pending approval or inactive.' });
        }

        // Don't send password back to the client
        delete user.password;
        
        res.json({ status: 200, message: 'Login successful', data: user });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

module.exports = router;
