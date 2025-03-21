// Backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
router.get('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update user (admin only)
router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const { fullName, email, role, department, permissions, password } = req.body;
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.department = department || user.department;
    user.permissions = permissions || user.permissions;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Reset password (admin only, simplified for now - no email sending)
router.post('/:id/reset-password', auth, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    const newPassword = Math.random().toString(36).slice(-8); // Generate random password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    // In a real app, send `newPassword` via email here
    res.json({ message: 'Mot de passe réinitialisé avec succès', newPassword }); // For testing
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Toggle user status (admin only)
router.patch('/:id/status', auth, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    user.status = req.body.status || (user.status === 'active' ? 'inactive' : 'active');
    await user.save();
    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;