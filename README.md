# Employee Management System

A simple web application to manage employee records using JsonPowerDB as the backend database. This project demonstrates basic CRUD operations with a clean, responsive user interface.

---

## About the Project

This is a submission for the second round selection process at Login2Xplore. The application allows users to add, view, update, and delete employee records stored in a JsonPowerDB database.

The project was built as part of the course "Introduction to JsonPowerDB - V2.0".

---

## Features

- Add new employee records with ID, name, email, salary, department, and joining date
- Search for an employee by their unique ID
- View all employees in a sortable table
- Edit existing employee details through a modal form
- Delete individual records with confirmation
- Auto-refresh table after each operation
- Responsive design that works on desktop and tablet devices

---

## Technology Stack

- HTML5
- CSS3 (Flexbox, Grid, custom properties)
- Vanilla JavaScript (ES6)
- JsonPowerDB (JPDB)

No frameworks or external libraries were used for core functionality.

---

## How to Run

1. Clone this repository to your local machine
2. Open the project folder
3. Locate the file: `src/index.html`
4. Open it in any modern web browser (Chrome recommended)

Note: JsonPowerDB API endpoints require CORS to be disabled or the application must be served through a local server. For development, you can disable CORS in Chrome using the command line or use a local server like Live Server in VS Code.

---

## Project Structure
EmployeeManagement/
│
├── src/
│ ├── index.html
│ ├── css/
│ │ └── style.css
│ └── js/
│ └── script.js
│
├── assets/
│
├── README.md
└── .gitignore


---

## API Configuration

The application uses the following JsonPowerDB endpoint:

- Base URL: `http://api.login2explore.com:5577`
- Database: `EmployeeDB`
- Relation: `EmployeeData`

The connection token is hardcoded in the script file. Replace it with your own token if needed.

---

## Author

Mohammad Hojaifa  
Login2Xplore Selection Round 2 Submission

---

## Date

April 2026