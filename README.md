# CodeCraftHub: Personalized Learning Platform

CodeCraftHub is a full-stack personalized learning management application designed for developers to track and manage their courses. Built using **Node.js and Express** for the backend REST API and a **single-file HTML/CSS/JavaScript dashboard** for the frontend, it stores course data locally in a `courses.json` file with zero external database setup required.

---

## Project Structure

```text
Final Project AI/
├── courses.json        # Auto-generated JSON file for persistent course storage
├── index.html          # Single-file Frontend Dashboard UI (HTML, CSS, Vanilla JS)
├── package.json        # Node.js project metadata and dependencies
├── package-lock.json   # Dependency lockfile
├── README.md           # Project documentation
└── server.js           # Express REST API backend server
```

---

## Prerequisites

Before running this project, ensure you have the following installed:
- **Node.js** (v16 or higher) & **npm** — [Download Node.js](https://nodejs.org/)
- **curl** — Built into Windows PowerShell (`curl.exe`), macOS, and Linux terminals
- **A modern web browser** (Chrome, Edge, Firefox, or Safari)

---

## Setup & Run Instructions

### 1. Install Backend Dependencies
Open a terminal in your project folder and install **Express** and **CORS**:

```bash
npm install express cors
```

### 2. Start the Backend Server
Run the Express server locally:

```bash
node server.js
```

You will see the confirmation message:
```text
CodeCraftHub API is running on http://localhost:3000/api/courses
```
*(Note: If `courses.json` does not exist yet, the server automatically creates it on startup.)*

### 3. Launch the Frontend Dashboard (Part 2)
While `node server.js` is running in your terminal, open **`index.html`** in your browser:
- **Windows PowerShell:**
  ```powershell
  start index.html
  ```
- **File Explorer / Finder:** Double-click `index.html` in your project directory.

---

## REST API Endpoints

Base URL: `http://localhost:3000/api/courses`

| HTTP Method | Endpoint | Description | Success Status |
|---|---|---|---|
| `GET` | `/api/courses` | Retrieve all courses (supports `?search=` and `?status=` query filters) | `200 OK` |
| `GET` | `/api/courses/:id` | Retrieve a single course by its numeric `id` | `200 OK` |
| `GET` | `/api/courses/stats` | Retrieve total course counts grouped by status | `200 OK` |
| `POST` | `/api/courses` | Create a new course | `201 Created` |
| `PUT` | `/api/courses/:id` | Update an existing course by its numeric `id` | `200 OK` |
| `DELETE` | `/api/courses/:id` | Delete a course by its numeric `id` | `200 OK` |

### Course Data Schema & Validation Rules
Every `POST` and `PUT` request requires a JSON body with the following fields:
- **`name`** *(string, required)*: Non-empty course title.
- **`description`** *(string, required)*: Non-empty course summary.
- **`target_date`** *(string, required)*: Target completion date in `YYYY-MM-DD` format.
- **`status`** *(string, required)*: Must match one of the three valid status values:
  - `Not Started`
  - `In Progress`
  - `Completed`

---

## Testing the API with `curl`

Open a second terminal window while `node server.js` is running to test all CRUD operations.

### Windows PowerShell Commands

**1. Create a Course (`POST`)**
```powershell
curl.exe --% -i -X POST http://localhost:3000/api/courses -H "Content-Type: application/json" -d "{\"name\":\"Full-Stack Node.js\",\"description\":\"Learn Express and REST APIs\",\"target_date\":\"2026-12-31\",\"status\":\"In Progress\"}"
```

**2. Get All Courses (`GET`)**
```powershell
curl.exe -i http://localhost:3000/api/courses
```

**3. Get a Single Course by ID (`GET`)**
```powershell
curl.exe -i http://localhost:3000/api/courses/1
```

**4. Update a Course (`PUT`)**
```powershell
curl.exe --% -i -X PUT http://localhost:3000/api/courses/1 -H "Content-Type: application/json" -d "{\"name\":\"Full-Stack Node.js (Updated)\",\"description\":\"Completed Express and REST APIs\",\"target_date\":\"2026-12-31\",\"status\":\"Completed\"}"
```

**5. Get Course Statistics (`GET`)**
```powershell
curl.exe -i http://localhost:3000/api/courses/stats
```

**6. Delete a Course (`DELETE`)**
```powershell
curl.exe -i -X DELETE http://localhost:3000/api/courses/1
```

---

### macOS / Linux / Git Bash Commands

```bash
# 1. Create a course
curl -i -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"name":"Full-Stack Node.js","description":"Learn Express and REST APIs","target_date":"2026-12-31","status":"In Progress"}'

# 2. Get all courses
curl -i http://localhost:3000/api/courses

# 3. Update course #1
curl -i -X PUT http://localhost:3000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Full-Stack Node.js (Updated)","description":"Completed Express and REST APIs","target_date":"2026-12-31","status":"Completed"}'

# 4. Delete course #1
curl -i -X DELETE http://localhost:3000/api/courses/1
```

---

## Troubleshooting

1. **`node : The term 'node' is not recognized` in VS Code Terminal**
   - Install Node.js (LTS) from [nodejs.org](https://nodejs.org/) and **restart VS Code completely** so the updated system `PATH` loads.
2. **`SyntaxError: Expected property name or '}' in JSON` on Windows PowerShell**
   - PowerShell strips double quotes when calling `curl.exe`. Always include the `--%` stop-parsing flag right after `curl.exe` (as shown in the PowerShell examples above).
3. **Frontend Dashboard says "Unable to connect to backend API"**
   - Make sure `node server.js` is actively running in your terminal and listening on `http://localhost:3000/api/courses`.
   - Ensure `app.use(cors())` is enabled in `server.js`.
4. **Port 3000 is already in use (`EADDRINUSE`)**
   - Stop any other running `node` process in your terminal with `Ctrl + C`, or run on another port.
