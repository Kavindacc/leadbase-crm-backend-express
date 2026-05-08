const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows you to parse JSON bodies from frontend POST requests

// Basic Test Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'LeadBase API is running smoothly!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});