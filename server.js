const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'courses.json');

// Enable CORS for browser-based frontends (Bolt.new / Bolt.diy) and JSON body parsing
app.use(cors());
app.use(express.json());

// Valid status enum values
const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed'];

// Helper: Initialize or read courses from JSON file
function readCourses() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return data.trim() ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading courses.json:', error);
    throw new Error('Failed to read course data storage.');
  }
}

// Helper: Write courses to JSON file
function writeCourses(courses) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(courses, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to courses.json:', error);
    throw new Error('Failed to save course data.');
  }
}

// Helper: Validate course payload
function validateCourseInput(body, isUpdate = false) {
  const { name, description, target_date, status } = body;
  const errors = [];

  if (!isUpdate || name !== undefined) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('Field "name" is required and must be a non-empty string.');
    }
  }

  if (!isUpdate || description !== undefined) {
    if (!description || typeof description !== 'string' || !description.trim()) {
      errors.push('Field "description" is required and must be a non-empty string.');
    }
  }

  if (!isUpdate || target_date !== undefined) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!target_date || !dateRegex.test(target_date) || isNaN(Date.parse(target_date))) {
      errors.push('Field "target_date" is required and must be in YYYY-MM-DD format.');
    }
  }

  if (!isUpdate || status !== undefined) {
    if (!status || !VALID_STATUSES.includes(status)) {
      errors.push(`Field "status" is required and must be one of: ${VALID_STATUSES.join(', ')}.`);
    }
  }

  return errors;
}

// ==========================================
// OPTIONAL EXPLORATION: GET /api/courses/stats
// ==========================================
app.get('/api/courses/stats', (req, res) => {
  try {
    const courses = readCourses();
    const stats = {
      total: courses.length,
      byStatus: {
        'Not Started': courses.filter(c => c.status === 'Not Started').length,
        'In Progress': courses.filter(c => c.status === 'In Progress').length,
        'Completed': courses.filter(c => c.status === 'Completed').length
      }
    };
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 1. GET /api/courses - Retrieve all courses (with optional ?search= & ?status= filters)
// ==========================================
app.get('/api/courses', (req, res) => {
  try {
    let courses = readCourses();
    const { search, status } = req.query;

    if (status) {
      courses = courses.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      courses = courses.filter(
        c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      );
    }

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. GET /api/courses/:id - Retrieve a single course by ID
// ==========================================
app.get('/api/courses/:id', (req, res) => {
  try {
    const courses = readCourses();
    const courseId = parseInt(req.params.id, 10);
    const course = courses.find(c => c.id === courseId);

    if (!course) {
      return res.status(404).json({ error: `Course with ID ${req.params.id} not found.` });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. POST /api/courses - Create a new course
// ==========================================
app.post('/api/courses', (req, res) => {
  try {
    const validationErrors = validateCourseInput(req.body, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    const courses = readCourses();
    const nextId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;

    const newCourse = {
      id: nextId,
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      target_date: req.body.target_date,
      status: req.body.status,
      created_at: new Date().toISOString()
    };

    courses.push(newCourse);
    writeCourses(courses);

    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. PUT /api/courses/:id - Update an existing course
// ==========================================
app.put('/api/courses/:id', (req, res) => {
  try {
    const courses = readCourses();
    const courseId = parseInt(req.params.id, 10);
    const index = courses.findIndex(c => c.id === courseId);

    if (index === -1) {
      return res.status(404).json({ error: `Course with ID ${req.params.id} not found.` });
    }

    const validationErrors = validateCourseInput(req.body, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    const updatedCourse = {
      ...courses[index],
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      target_date: req.body.target_date,
      status: req.body.status
    };

    courses[index] = updatedCourse;
    writeCourses(courses);

    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. DELETE /api/courses/:id - Delete a course
// ==========================================
app.delete('/api/courses/:id', (req, res) => {
  try {
    const courses = readCourses();
    const courseId = parseInt(req.params.id, 10);
    const index = courses.findIndex(c => c.id === courseId);

    if (index === -1) {
      return res.status(404).json({ error: `Course with ID ${req.params.id} not found.` });
    }

    const deletedCourse = courses.splice(index, 1)[0];
    writeCourses(courses);

    res.status(200).json({
      message: `Course with ID ${courseId} deleted successfully.`,
      course: deletedCourse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  // Ensure courses.json exists on startup
  readCourses();
  console.log(`CodeCraftHub API is running on http://localhost:${PORT}/api/courses`);
});
