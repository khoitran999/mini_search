const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const Item = require('./Item');  // Make sure this path is correct

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/homework', {
      // Removed deprecated options
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Retry connection
    setTimeout(connectDB, 5000);
  }
};

// Middleware
app.set('view engine', 'pug');
app.set('views', path.join(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

// Create Item Endpoint
app.post('/create-item', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ 
        error: 'Name is required',
        success: false 
      });
    }

    // Create new item
    const newItem = new Item({
      name,
      description: description || ''
    });

    // Save to database
    await newItem.save();

    res.status(201).json({
      message: 'Item created successfully',
      item: newItem,
      success: true
    });
  } catch (error) {
    console.error('Error creating item:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation Failed', 
        messages,
        success: false 
      });
    }

    res.status(500).json({ 
      error: 'Failed to create item',
      details: error.message,
      success: false 
    });
  }
});

// Search Items Endpoint
app.get('/search-items', async (req, res) => {
  try {
    const { query } = req.query;
    
    // If no query, return all items
    let items;
    if (query) {
      // Use text search if query exists
      items = await Item.find({ 
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      });
    } else {
      // Return all items if no query
      items = await Item.find({});
    }

    res.json({
      items,
      success: true,
      message: items.length ? 'Items found' : 'No items found'
    });
  } catch (error) {
    console.error('Error searching items:', error);
    res.status(500).json({ 
      error: 'Failed to search items',
      details: error.message,
      success: false 
    });
  }
});

// Start server and connect to database
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();

// Optional: Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});