const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-product-info-page-domain.com']
}));
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test route
app.get('/ping', (req, res) => {
  res.json({ message: 'pong', status: 'success' });
});

// Import routes
const batchRoutes = require('./routes/batches');
const productRoutes = require('./routes/products');

// Use routes
app.use('/api/batches', batchRoutes);
app.use('/api/products', productRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});