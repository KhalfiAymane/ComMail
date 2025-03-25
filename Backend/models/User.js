// backend/models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
  },
  department: {
    type: String, // Removed enum to allow free-text input
    required: [true, 'Le département est requis'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'president', 'dgs', 'bo', 'sc', 'sp', 'rh', 'dfm', 'dt', 'bh', 'pc', 'ic'],
    default: 'user', // Default to 'user' if not provided
  },
  permissions: [{
    type: String,
    enum: [
      'create:courrier',
      'read:courrier',
      'update:courrier',
      'delete:courrier',
      'assign:courrier',
      'manage:users',
    ],
    default: ['read:courrier'],
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);