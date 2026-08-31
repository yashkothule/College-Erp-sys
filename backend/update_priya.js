const db = require('./config/db');

async function fixPriya() {
    try {
        await db.query(`
            UPDATE users 
            SET program = 'MCA', semester = 3, academic_year = '2025-26' 
            WHERE id = 'STU2024001'
        `);
        console.log("✅ Successfully updated Priya's profile to MCA Sem 3!");
        
        const [users] = await db.query(`SELECT id, name, program, semester FROM users WHERE id = 'STU2024001'`);
        console.log("Current Database Entry:", users[0]);
    } catch (err) {
        console.error("Error updating database:", err);
    } finally {
        process.exit(0);
    }
}

fixPriya();
