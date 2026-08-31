const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/users
router.get('/', async (req, res) => {
    try {
        const { role, status } = req.query;
        let query = 'SELECT id, name, email, role, program, semester, academic_year, status FROM users WHERE 1=1';
        const params = [];
        
        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        
        const [users] = await db.query(query, params);
        res.json({ status: 200, message: 'Success', data: users });
    } catch (error) {
        console.error("Fetch Users Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// POST /api/users
router.post('/', async (req, res) => {
    const { id, name, email, password, role, program, semester, academic_year, status } = req.body;
    try {
        const query = `INSERT INTO users (id, name, email, password, role, program, semester, academic_year, status) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await db.query(query, [id, name, email, password, role, program || null, semester || null, academic_year || null, status || 'active']);
        res.status(201).json({ status: 201, message: 'User created successfully' });
    } catch (error) {
        console.error("Create User Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, program, semester, academic_year, status FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) return res.status(404).json({ status: 404, message: 'User not found' });
        res.json({ status: 200, message: 'Success', data: users[0] });
    } catch (error) {
        console.error("Fetch User Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, program, semester, status } = req.body;
    try {
        await db.query(
            'UPDATE users SET name = ?, email = ?, program = ?, semester = ?, status = ? WHERE id = ?',
            [name, email, program, semester, status, id]
        );
        res.json({ status: 200, message: 'User updated successfully' });
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// PUT /api/users/:id/status
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        res.json({ status: 200, message: 'Status updated successfully' });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ status: 200, message: 'User deleted successfully' });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

module.exports = router;
