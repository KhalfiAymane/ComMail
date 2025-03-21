// Backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Compte non trouvé' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email, 
        department: user.department, 
        role: user.role,
        permissions: user.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  try {
    const { email, password, department, role, permissions } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      department,
      role, // Include role
      permissions: permissions || ['read:courrier']
    });

    await user.save();
    const userResponse = await User.findById(user._id).select('-password');
    res.status(201).json({ ...userResponse._doc, plainPassword: password });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};