const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

// Serve static files from client directory
app.use(express.static(path.join(__dirname, 'client')));

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
});