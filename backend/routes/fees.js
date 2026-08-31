const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/fees
router.post('/', async (req, res) => {
    const { studentId, amount, feeType, paymentMode, referenceNo } = req.body;
    
    try {
        if (!studentId || !amount || !feeType || !paymentMode) {
            return res.status(400).json({ status: 400, message: 'Missing required fields' });
        }

        const query = `
            INSERT INTO fees (student_id, amount, fee_type, payment_mode, reference_no, status)
            VALUES (?, ?, ?, ?, ?, 'Paid')
        `;
        
        const [result] = await db.query(query, [studentId, amount, feeType, paymentMode, referenceNo || null]);
        
        res.status(201).json({ status: 201, message: 'Fee payment processed successfully', data: { receiptId: result.insertId } });
    } catch (error) {
        console.error("Process Fee Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// GET /api/fees/receipt/:id
router.get('/receipt/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const query = `
            SELECT f.*, u.name as student_name, u.program, u.semester 
            FROM fees f 
            JOIN users u ON f.student_id = u.id 
            WHERE f.id = ?
        `;
        const [fees] = await db.query(query, [id]);
        
        if (fees.length === 0) {
            return res.status(404).json({ status: 404, message: 'Receipt not found' });
        }
        
        res.json({ status: 200, message: 'Success', data: fees[0] });
    } catch (error) {
        console.error("Fetch Receipt Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

// GET /api/fees/student/:studentId
router.get('/student/:studentId', async (req, res) => {
    const { studentId } = req.params;
    
    try {
        const query = 'SELECT * FROM fees WHERE student_id = ? ORDER BY payment_date DESC';
        const [fees] = await db.query(query, [studentId]);
        res.json({ status: 200, message: 'Success', data: fees });
    } catch (error) {
        console.error("Fetch Student Fees Error:", error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

module.exports = router;
