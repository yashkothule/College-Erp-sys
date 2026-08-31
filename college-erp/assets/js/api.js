/**
 * ============================================================
 * API SERVICE - College ERP Management System
 * File: assets/js/api.js
 * Description: Connects to the Node.js/Express Backend via fetch()
 * ============================================================
 */

'use strict';

const BASE_URL = 'http://localhost:5000/api';

const API = {
    /**
     * Fetch student dashboard overview
     * @returns {Promise<Object>}
     */
    async getStudentOverview() {
        try {
            const sessionUser = JSON.parse(sessionStorage.getItem('erp_user') || '{}');
            if (!sessionUser.id) throw new Error("Not logged in");

            // 1. Fetch all users from backend to find this student
            const usersRes = await fetch(`${BASE_URL}/users?role=student`);
            const usersData = await usersRes.json();
            const myUser = usersData.data.find(u => u.id === sessionUser.id);

            // 2. Fetch all courses
            const coursesRes = await fetch(`${BASE_URL}/courses`);
            const coursesData = await coursesRes.json();
            const allCourses = coursesData.data;

            if (myUser) {
                // Match courses based on program and semester
                const matchedCourses = allCourses.filter(c => 
                    c.department && 
                    myUser.program &&
                    c.department.toLowerCase().includes(myUser.program.toLowerCase()) && 
                    String(c.semester) === String(myUser.semester)
                ).length;

                return {
                    status: 200,
                    message: "Success",
                    data: {
                        name: myUser.name,
                        program: myUser.program || "Unknown",
                        semester: myUser.semester || 1,
                        cgpa: "N/A",  
                        academicYear: myUser.academic_year || "2025-26",
                        stats: {
                            enrolledCourses: matchedCourses,
                            currentCgpa: "N/A",
                            attendance: "--",
                            pendingFees: 0
                        }
                    }
                };
            }
            throw new Error("Student data not found in DB");
        } catch (error) {
            console.error("API Error - getStudentOverview:", error);
            // Fallback empty response
            return { data: { stats: {} }, status: 500, message: "Error loading data" };
        }
    },

    /**
     * Fetch student's enrolled courses
     * @returns {Promise<Array>}
     */
    async getEnrolledCourses() {
        try {
            const sessionUser = JSON.parse(sessionStorage.getItem('erp_user') || '{}');
            
            const usersRes = await fetch(`${BASE_URL}/users?role=student`);
            const usersData = await usersRes.json();
            const myUser = usersData.data.find(u => u.id === sessionUser.id);

            if (myUser) {
                const coursesRes = await fetch(`${BASE_URL}/courses`);
                const coursesData = await coursesRes.json();
                
                const userCourses = coursesData.data.filter(c => 
                    c.department && 
                    myUser.program &&
                    c.department.toLowerCase().includes(myUser.program.toLowerCase()) && 
                    String(c.semester) === String(myUser.semester)
                ).map(c => {
                    return {
                        code: c.code,
                        name: c.title,
                        faculty: "Unassigned", // To be updated when assignments are linked
                        credits: c.credits,
                        attendance: "--",
                        internalMarks: "--",
                        status: "Ongoing",
                        statusClass: "info"
                    };
                });
                
                return { data: userCourses, status: 200, message: "Success" };
            }
            return { data: [], status: 404, message: "User not found" };
        } catch (error) {
            console.error("API Error - getEnrolledCourses:", error);
            return { data: [], status: 500, message: "Error loading courses" };
        }
    },

    /**
     * Fetch list of all available courses
     * @returns {Promise<Array>}
     */
    async getAllCourses() {
        try {
            const response = await fetch(`${BASE_URL}/courses`);
            const data = await response.json();
            
            // Map the DB fields to the format the frontend expects temporarily
            const formattedData = data.data.map(c => ({
                code: c.code,
                name: c.title,
                programTarget: `${c.department} (Sem ${c.semester})`,
                credits: c.credits,
                type: c.type,
                faculty: "Unassigned",
                typeColor: c.type.toLowerCase() === 'core' ? 'blue' : 'green'
            }));

            return { data: formattedData, status: 200, message: "Success" };
        } catch (error) {
            console.error("API Error - getAllCourses:", error);
            return { data: [], status: 500, message: "Error loading courses" };
        }
    }
};

window.API = API;
