const db = require('./config/db');

async function seedData() {
    try {
        const users = [
            ['admin001', 'Admin User', 'admin@college.edu', 'admin123', 'admin', null, null, null, 'active'],
            ['FAC2024001', 'Prof. R. Sharma', 'rsharma@college.edu', 'faculty123', 'faculty', null, null, null, 'active'],
            ['STU2024001', 'Priya Sharma', 'priya@college.edu', 'student123', 'student', 'MCA', 2, '2025-26', 'active']
        ];
        
        for (const user of users) {
            await db.query(`
                INSERT INTO users (id, name, email, password, role, program, semester, academic_year, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE name=VALUES(name)
            `, user);
        }
        
        const courses = [
            ['MCA201', 'Data Structures and Algorithms', 'Core DSA concepts', 'MCA', 2, 4, 'Core'],
            ['MCA202', 'Database Management Systems', 'RDBMS and NoSQL', 'MCA', 2, 4, 'Core']
        ];
        
        for (const course of courses) {
            await db.query(`
                INSERT INTO courses (code, title, description, department, semester, credits, type)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE title=VALUES(title)
            `, course);
        }
        
        console.log('Seed data inserted successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
}

seedData();
