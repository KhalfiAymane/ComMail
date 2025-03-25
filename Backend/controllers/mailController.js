const mongoose = require('mongoose');
const Mail = require('../models/Mail');
const User = require('../models/User');

// Define allowed departments per role (mirrors frontend logic)
const getAllowedReceiverDepartments = (role) => {
  const allDepartments = [
    'Présidence',
    'Direction Générale des Services',
    'Bureau d\'Ordre',
    'Secrétariat du Conseil',
    'Secrétariat du Président',
    'Ressources Humaines',
    'Division Financière',
    'Division Technique',
    'Bureau d\'Hygiène',
    'Partenariat et Coopération',
    'Informatique et Communication',
    'Administration'
  ];

  switch (role) {
    case 'president':
    case 'dgs':
    case 'admin':
      return allDepartments; // Can communicate with all
    case 'bo':
      return ['Direction Générale des Services'];
    case 'sc':
    case 'sp':
    case 'rh':
    case 'dfm':
    case 'dt':
    case 'bh':
    case 'pc':
    case 'ic':
      return ['Bureau d\'Ordre', 'Direction Générale des Services'];
    default:
      return []; // No permissions
  }
};

exports.createMail = async (req, res) => {
  try {
    const { type, subject, content, receiverDepartments } = req.body;
    const sender = req.user.userId;

    const parsedReceiverDepartments = JSON.parse(receiverDepartments || '[]');
    // No normalization needed since NewCourrierModal now uses curly quotes

    const mail = new Mail({
      type: type || 'officiel',
      subject,
      content,
      sender,
      receiverDepartments: parsedReceiverDepartments, // Should be ["Bureau d’Ordre"]
      attachments: [],
      status: 'en_attente',
      section: 'inbox',
      history: [{ action: 'created', user: sender, timestamp: new Date() }],
    });

    if (req.files) {
      mail.attachments = req.files.map(file => ({
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }));
    }

    await mail.save();
    const populatedMail = await Mail.findById(mail._id)
      .populate('sender', 'email department role');
    console.log('Mail saved successfully:', populatedMail);
    res.status(201).json(populatedMail);
  } catch (err) {
    console.error('Error in createMail:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllMails = async (req, res) => {
  try {
    const filter = {};
    const userId = req.user.userId;
    const userDepartment = req.user.department;
    const userRole = req.user.role;

    if (req.query.type) filter.type = { $in: req.query.type.split(',') };
    if (req.query.status) filter.status = { $in: req.query.status.split(',') };
    if (req.query.receiverDepartment) filter.receiverDepartments = { $in: req.query.receiverDepartment.split(',') };
    if (req.query.subject) filter.subject = { $regex: req.query.subject, $options: 'i' };

    if (req.query.section === 'sent') {
      filter.sender = userId;
    } else if (req.query.section === 'inbox') {
      filter.receiverDepartments = userDepartment;
    } else if (req.query.section === 'drafts') {
      filter.sender = userId;
      filter.status = 'en_attente';
    } else if (req.query.section === 'archives') {
      if (['admin', 'dgs'].includes(userRole)) {
        filter.section = 'archives'; // Centralized view for admin/dgs
      } else {
        filter.$or = [
          { sender: userId },
          { receiverDepartments: userDepartment }
        ];
        filter.section = 'archives';
      }
    }

    // Remove restrictive role-based filter for non-privileged roles
    console.log('Fetching mails with filter:', filter, 'for user:', { userId, userDepartment, userRole });

    const mails = await Mail.find(filter)
      .populate('sender', 'email department role')
      .sort({ createdAt: -1 });

    res.json(mails);
  } catch (err) {
    console.error('Error in getAllMails:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.validateMail = async (req, res) => {
  const mail = await Mail.findById(req.params.id);
  if (!mail) return res.status(404).json({ error: 'Courrier introuvable' });

  if (req.user.role !== 'dgs' || !mail.receiverDepartments.includes(req.user.department)) {
    return res.status(403).json({ error: 'Action non autorisée' });
  }

  mail.status = 'validé';
  await mail.save();
  res.json(mail);
};

exports.updateMailStatus = async (req, res) => {
  try {
    const mail = await Mail.findById(req.params.id);
    if (!mail) return res.status(404).json({ error: 'Courrier introuvable' });

    const isSender = mail.sender.toString() === req.user.userId;
    const isReceiver = mail.receiverDepartments.includes(req.user.department);

    if (!isSender && !isReceiver) {
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    const { status, section, rejectionReason } = req.body;
    if (status) mail.status = status;
    if (section) mail.section = section;
    if (rejectionReason && status === 'rejeté') mail.rejectionReason = rejectionReason;

    mail.history.push({
      action: status || section,
      user: req.user.userId,
      timestamp: new Date()
    });

    if (section === 'archives') {
      mail.archivedBy = req.user.userId;
    }

    await mail.save();
    const populatedMail = await Mail.findById(mail._id)
      .populate('sender', 'email department role');
    res.json(populatedMail);
  } catch (err) {
    console.error('Error in updateMailStatus:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add this to mailController.js
exports.updateMail = async (req, res) => {
  try {
    const mail = await Mail.findById(req.params.id);
    if (!mail) return res.status(404).json({ error: 'Courrier introuvable' });

    // Check if user has permission (sender or receiver department match)
    const isSender = mail.sender.toString() === req.user.userId;
    const isReceiver = mail.receiverDepartments.includes(req.user.department);
    if (!isSender && !isReceiver && !['admin', 'dgs'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    // Update only allowed fields (e.g., favorite, isRead)
    const updates = {};
    if (typeof req.body.favorite !== 'undefined') updates.favorite = req.body.favorite;
    if (typeof req.body.isRead !== 'undefined') updates.isRead = req.body.isRead;

    const updatedMail = await Mail.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate('sender', 'email department role');

    if (!updatedMail) return res.status(404).json({ error: 'Courrier introuvable' });

    res.json(updatedMail);
  } catch (err) {
    console.error('Error in updateMail:', err);
    res.status(500).json({ error: err.message });
  }
};

