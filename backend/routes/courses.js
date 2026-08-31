const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/courses
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT c.*, u.name AS faculty, u.id AS facultyId
            FROM courses c
            LEFT JOIN user_courses uc ON c.code = uc.course_code AND uc.role = 'faculty'
            LEFT JOIN users u ON uc.user_id = u.id
        `;
        const [courses] = await db.query(query);
        res.json({ status: 200, message: 'Success', data: courses });
    } catch (error) {
        console.error("Fetch Courses Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// POST /api/courses
router.post('/', async (req, res) => {
    const { code, title, description, department, semester, credits, type } = req.body;
    try {
        const query = `INSERT INTO courses (code, title, description, department, semester, credits, type) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await db.query(query, [code, title, description, department, semester, credits, type]);
        res.status(201).json({ status: 201, message: 'Course created successfully' });
    } catch (error) {
        console.error("Create Course Error:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: 400, message: 'Course code already exists' });
        }
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// DELETE /api/courses/:code
router.delete('/:code', async (req, res) => {
    const { code } = req.params;
    try {
        await db.query('DELETE FROM courses WHERE code = ?', [code]);
        res.json({ status: 200, message: 'Course deleted successfully' });
    } catch (error) {
        console.error("Delete Course Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// POST /api/courses/:code/assign
router.post('/:code/assign', async (req, res) => {
    const { code } = req.params;
    const { facultyId } = req.body;
    try {
        // Remove existing assigned faculty
        await db.query('DELETE FROM user_courses WHERE course_code = ? AND role = "faculty"', [code]);
        
        // Add new faculty if facultyId is provided
        if (facultyId) {
            await db.query('INSERT INTO user_courses (user_id, course_code, role) VALUES (?, ?, "faculty")', [facultyId, code]);
        }
        res.json({ status: 200, message: 'Faculty assigned successfully' });
    } catch (error) {
        console.error("Assign Faculty Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

module.exports = router;
