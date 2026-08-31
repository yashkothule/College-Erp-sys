# College ERP System

A full-stack College Enterprise Resource Planning (ERP) system designed to centralize and simplify academic and administrative management through a web-based application.

The system provides a structured platform for managing students, faculty, courses, attendance, fees, academic records, and other college operations.

## Features

- Admin dashboard
- Student management
- Faculty management
- Course and department management
- Attendance management
- Academic record management
- Fee management
- REST API-based backend
- MySQL database integration
- Database schema initialization
- Seed data management
- PDF generation
- Web-based user interface

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MySQL 8

### Tools & Technologies
- REST APIs
- Git
- GitHub
- VS Code
- PDF generation

## System Architecture

```text
┌───────────────────────┐
│       Frontend        │
│   HTML / CSS / JS     │
└───────────┬───────────┘
            │
            │ HTTP / REST API
            ▼
┌───────────────────────┐
│       Backend         │
│   Node.js / Express   │
└───────────┬───────────┘
            │
            │ Database Queries
            ▼
┌───────────────────────┐
│        MySQL          │
│     college_erp       │
└───────────────────────┘
