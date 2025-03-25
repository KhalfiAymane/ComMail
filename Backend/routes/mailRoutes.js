// Backend/routes/mailRoutes.js
const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const upload = require('../utils/fileUpload');
const Mail = require('../models/Mail');
const {
  createMail,
  getAllMails,
  validateMail,
  updateMailStatus,
  updateMail
} = require('../controllers/mailController');

router.get('/mails-and-counts', auth, async (req, res) => {
  console.log('Reached /mails-and-counts endpoint');
  try {
    const userId = req.user.userId;
    const userDepartment = req.user.department; // "Bureau d’Ordre" with curly quotes
    const role = req.user.role;

    const { section, type, receiverDepartments, status, subject } = req.query;

    const filter = {};
    if (section === 'sent') {
      filter.sender = userId;
    } else if (section === 'inbox') {
      filter.receiverDepartments = userDepartment; // Exact match for "Bureau d’Ordre"
    } else if (section === 'drafts') {
      filter.sender = userId;
      filter.status = 'en_attente';
    } else if (section === 'archives') {
      if (['admin', 'dgs'].includes(role)) {
        filter.section = 'archives';
      } else {
        filter.$or = [
          { sender: userId },
          { receiverDepartments: userDepartment }
        ];
        filter.section = 'archives';
      }
    } else if (section === 'pendingValidation') {
      filter.status = 'en_attente';
      filter.receiverDepartments = userDepartment;
    }

    if (type) filter.type = { $in: type.split(',') };
    if (receiverDepartments) filter.receiverDepartments = { $in: receiverDepartments.split(',') };
    if (status && section !== 'pendingValidation') filter.status = { $in: status.split(',') };
    if (subject) filter.subject = { $regex: subject, $options: 'i' };

    console.log('Filter applied:', filter, 'User:', { userId, userDepartment, role });

    const courriers = await Mail.find(filter)
      .populate('sender', 'email department role')
      .populate('archivedBy', 'email')
      .sort({ createdAt: -1 });

    console.log('Courriers found:', courriers.length, 'Data:', courriers);

    const counts = {};
    const sections = ['inbox', 'sent', 'drafts', 'archives', 'pendingValidation'];
    for (const sec of sections) {
      const countFilter = {};
      if (sec === 'sent') {
        countFilter.sender = userId;
      } else if (sec === 'inbox') {
        countFilter.receiverDepartments = userDepartment;
      } else if (sec === 'drafts') {
        countFilter.sender = userId;
        countFilter.status = 'en_attente';
      } else if (sec === 'archives') {
        if (['admin', 'dgs'].includes(role)) {
          countFilter.section = 'archives';
        } else {
          countFilter.$or = [
            { sender: userId },
            { receiverDepartments: userDepartment }
          ];
          countFilter.section = 'archives';
        }
      } else if (sec === 'pendingValidation') {
        countFilter.status = 'en_attente';
        countFilter.receiverDepartments = userDepartment;
      }
      counts[sec] = await Mail.countDocuments(countFilter);
    }

    res.json({ courriers, counts });
  } catch (err) {
    console.error('Error in /mails-and-counts:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/counts', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userDepartment = req.user.department;
    const counts = {};

    const sections = ['inbox', 'sent', 'drafts', 'archives'];
    for (const section of sections) {
      const filter = {};
      if (section === 'sent') {
        filter.sender = userId;
      } else if (section === 'inbox') {
        filter.receiverDepartments = userDepartment;
      } else if (section === 'drafts') {
        filter.sender = userId;
        filter.status = 'en_attente';
      } else if (section === 'archives') {
        filter.$or = [
          { sender: userId },
          { receiverDepartments: userDepartment }
        ];
        filter.section = 'archives';
      }

      if (!['admin', 'president', 'dgs'].includes(req.user.role)) {
        const baseFilter = filter.$or || [];
        filter.$or = [
          ...baseFilter,
          { sender: userId },
          { receiverDepartments: userDepartment }
        ];
      }

      counts[section] = await Mail.countDocuments(filter);
    }

    res.json(counts);
  } catch (err) {
    console.error('Error in /counts:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a mail with attachments (roles allowed to create mails)
router.post(
  '/',
  auth,
  checkRole(['president', 'dgs', 'bo', 'rh', 'admin']),
  upload.array('attachments', 5),
  createMail
);

// Validate a mail (PATCH route)
router.patch(
  '/:id/validate',
  auth,
  checkRole(['directeur', 'admin', 'president', 'dgs']),
  validateMail
);

// Update mail status or section (PUT route for validate/reject/archive)
router.put('/:id/status', auth, updateMailStatus);
router.put('/:id', auth, updateMail);
// Delete a mail
router.delete('/:id', auth, async (req, res) => {
  try {
    const mail = await Mail.findById(req.params.id);
    if (!mail) return res.status(404).json({ error: 'Courrier not found' });
    if (mail.sender.toString() !== req.user.userId && !['admin', 'dgs'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    await Mail.deleteOne({ _id: req.params.id });
    res.json({ message: 'Courrier deleted' });
  } catch (err) {
    console.error('Error in DELETE /mails/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// List all mails with filters
router.get('/', auth, getAllMails);

module.exports = router;