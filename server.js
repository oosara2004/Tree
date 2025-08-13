const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API routes that might have been handled by Flask
app.post('/api/auth/signin', (req, res) => {
    // Handle sign in logic here
    res.json({ success: true, message: 'Sign in endpoint' });
});

app.post('/api/auth/signup', (req, res) => {
    // Handle sign up logic here
    res.json({ success: true, message: 'Sign up endpoint' });
});

app.get('/api/dashboard', (req, res) => {
    // Handle dashboard data
    res.json({ success: true, data: 'Dashboard data' });
});

app.post('/api/scanner', (req, res) => {
    // Handle scanner functionality
    res.json({ success: true, message: 'Scanner endpoint' });
});

app.get('/api/notifications', (req, res) => {
    // Handle notifications
    res.json({ success: true, notifications: [] });
});

// Catch-all handler for HTML files
app.get('*.html', (req, res) => {
    const filename = req.params[0] + '.html';
    res.sendFile(path.join(__dirname, filename));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});