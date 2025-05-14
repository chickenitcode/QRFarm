const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Define specific routes for your HTML files
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/product.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'product.html'));
});

app.get('/batch.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'batch.html'));
});

// Default route for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Landing page server running at http://localhost:${PORT}`);
  console.log(`API server should be running at your API URL`);
});