const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/marks (Submit marks for multiple students)
router.post('/', async (req, res) => {
    const { courseCode, examType, maxMarks, marks } = req.body;
    
    // marks should be an array of objects: [{ studentId, marksObtained, status }]
    
    try {
        if (!marks || !Array.isArray(marks) || marks.length === 0) {
            return res.status(400).json({ status: 400, message: 'No marks data provided' });
        }

        // We use INSERT ... ON DUPLICATE KEY UPDATE to handle updates
        const query = `
            INSERT INTO marks (student_id, course_code, marks_obtained, max_marks, exam_type, status)
            VALUES ?
            ON DUPLICATE KEY UPDATE 
                marks_obtained = VALUES(marks_obtained),
                max_marks = VALUES(max_marks),
                status = VALUES(status)
        `;
        
        const values = marks.map(m => [
            m.studentId, 
            courseCode, 
            m.marksObtained, 
            maxMarks, 
            examType, 
            m.status || 'Pending'
        ]);

        await db.query(query, [values]);
        
        res.status(201).json({ status: 201, message: 'Marks submitted successfully' });
    } catch (error) {
        console.error("Submit Marks Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// GET /api/marks/:courseCode
router.get('/:courseCode', async (req, res) => {
    const { courseCode } = req.params;
    const { examType } = req.query;
    
    try {
        let query = 'SELECT m.*, u.name as student_name FROM marks m JOIN users u ON m.student_id = u.id WHERE m.course_code = ?';
        const params = [courseCode];
        
        if (examType) {
            query += ' AND m.exam_type = ?';
            params.push(examType);
        }
        
        const [marks] = await db.query(query, params);
        res.json({ status: 200, message: 'Success', data: marks });
    } catch (error) {
        console.error("Fetch Marks Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// GET /api/marks/student/:studentId
router.get('/student/:studentId', async (req, res) => {
    const { studentId } = req.params;
    
    try {
        const query = 'SELECT m.*, c.title as course_title FROM marks m JOIN courses c ON m.course_code = c.code WHERE m.student_id = ?';
        const [marks] = await db.query(query, [studentId]);
        res.json({ status: 200, message: 'Success', data: marks });
    } catch (error) {
        console.error("Fetch Student Marks Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

module.exports = router;
