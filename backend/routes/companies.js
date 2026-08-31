const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/companies
router.get('/', async (req, res) => {
    try {
        const [companies] = await db.query('SELECT * FROM companies ORDER BY created_at DESC');
        res.json({ status: 200, message: 'Success', data: companies });
    } catch (error) {
        console.error("Fetch Companies Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// POST /api/companies
router.post('/', async (req, res) => {
    const { compName, role, package: pkg, minCgpa, drive_date } = req.body;
    try {
        await db.query(
            'INSERT INTO companies (compName, role, package, minCgpa, drive_date) VALUES (?, ?, ?, ?, ?)',
            [compName, role, pkg, minCgpa, drive_date || null]
        );
        res.status(201).json({ status: 201, message: 'Company registered successfully' });
    } catch (error) {
        console.error("Create Company Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// DELETE /api/companies/:id
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM companies WHERE id = ?', [req.params.id]);
        res.json({ status: 200, message: 'Company deleted successfully' });
    } catch (error) {
        console.error("Delete Company Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

module.exports = router;
