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
  console.log('Received createMail request:', {
    body: req.body,
    files: req.files,
    user: req.user
  });

  try {
    const allowedRoles = ['admin', 'bo', 'dgs', 'president', 'sc', 'sp', 'rh', 'dfm', 'dt', 'bh', 'pc', 'ic'];
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission refusée' });
    }

    if (!req.user.userId) {
      console.error('req.user.userId is undefined. Check JWT token or auth middleware.');
      return res.status(500).json({ error: 'Utilisateur non identifié. Vérifiez votre connexion.' });
    }

    let receiverDepartments = req.body.receiverDepartments;
    if (typeof receiverDepartments === 'string') {
      receiverDepartments = JSON.parse(receiverDepartments);
    }
    const departments = Array.isArray(receiverDepartments) ? receiverDepartments : [receiverDepartments].filter(Boolean);

    if (departments.length === 0) {
      return res.status(400).json({ error: 'At least one receiver department must be specified' });
    }

    // Validate receiver departments against sender role
    const allowedDepartments = getAllowedReceiverDepartments(req.user.role);
    const invalidDepartments = departments.filter(dept => !allowedDepartments.includes(dept));
    if (invalidDepartments.length > 0) {
      return res.status(403).json({ 
        error: `You are not allowed to send to: ${invalidDepartments.join(', ')}` 
      });
    }

    const mail = new Mail({
      type: req.body.type || 'officiel',
      subject: req.body.subject,
      content: req.body.content,
      sender: req.user.userId,
      receiverDepartments: departments,
      attachments: req.files?.map(file => file.path) || [],
      section: departments.length > 0 ? 'sent' : 'drafts',
      isRead: false,
      status: req.user.role === 'admin' ? 'validé' : 'en_attente'
    });

    const savedMail = await mail.save();
    const populatedMail = await Mail.findById(savedMail._id)
      .populate('sender', 'email department role')
      .lean();
    
    console.log('Mail saved successfully:', populatedMail);
    res.status(201).json(populatedMail);
  } catch (err) {
    console.error('Error in createMail:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getAllMails = async (req, res) => {
  try {
    const filter = {};
    const userId = req.user.userId;
    const userDepartment = req.user.department;

    if (req.query.type) filter.type = { $in: req.query.type.split(',') };
    if (req.query.status) filter.status = { $in: req.query.status.split(',') };
    if (req.query.receiverDepartment) filter.receiverDepartments = { $in: req.query.receiverDepartment.split(',') };
    if (req.query.subject) filter.subject = { $regex: req.query.subject, $options: 'i' };

    if (req.query.section === 'sent') {
      filter.sender = userId;
    } else if (req.query.section === 'inbox') {
      filter.receiverDepartments = userDepartment; // Only departments now
    } else if (req.query.section === 'drafts') {
      filter.sender = userId;
      filter.status = 'en_attente';
    } else if (req.query.section === 'archives') {
      filter.$or = [
        { sender: userId },
        { receiverDepartments: userDepartment }
      ];
      filter.status = { $in: ['validé', 'rejeté'] };
    }

    if (!['admin', 'president', 'dgs'].includes(req.user.role)) {
      const baseFilter = filter.$or || [];
      filter.$or = [
        ...baseFilter,
        { sender: userId },
        { receiverDepartments: userDepartment }
      ];
    }

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

    const isDirector = req.user.role === 'dgs' && mail.receiverDepartments.includes(req.user.department);
    const isAdmin = req.user.role === 'admin';
    if (!isDirector && !isAdmin) return res.status(403).json({ error: 'Action non autorisée' });

    const { status, section, rejectionReason } = req.body;
    if (status) mail.status = status;
    if (section) mail.section = section;
    if (rejectionReason && status === 'rejeté') mail.rejectionReason = rejectionReason;

    mail.history.push({
      action: status || section,
      user: req.user.userId,
      timestamp: new Date()
    });

    await mail.save();
    const populatedMail = await Mail.findById(mail._id)
      .populate('sender', 'email department role');
    res.json(populatedMail);
  } catch (err) {
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

