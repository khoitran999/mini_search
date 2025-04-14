const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Enable validation on update
  runValidators: true
});

// Optional: Add a text index for better search
ItemSchema.index({ name: 'text', description: 'text' });

const Item = mongoose.model('Item', ItemSchema);

module.exports = Item;