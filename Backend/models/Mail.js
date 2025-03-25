const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    default: () => `MAIL-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  },
  type: {
    type: String,
    enum: ['officiel', 'urgent', 'interne'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverDepartments: [{
    type: String,
    enum: [
      'Présidence',
      'Direction Générale des Services',
      'Bureau d’Ordre', // Updated to curly quotes
      'Secrétariat du Conseil',
      'Secrétariat du Président',
      'Ressources Humaines',
      'Division Financière',
      'Division Technique',
      'Bureau d’Hygiène', // Updated to curly quotes
      'Partenariat et Coopération',
      'Informatique et Communication',
      'Administration'
    ]
  }],
  attachments: [{ type: String }],
  status: {
    type: String,
    enum: ['en_attente', 'validé', 'rejeté'],
    default: 'en_attente'
  },
  section: {
    type: String,
    enum: ['inbox', 'sent', 'drafts', 'archives'],
    default: 'drafts'
  },
  rejectionReason: { type: String, default: '' },
  history: [{
    action: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  favorite: { type: Boolean, default: false },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  validate: {
    validator: function() {
      return this.receiverDepartments && this.receiverDepartments.length > 0;
    },
    message: 'At least one receiver department must be specified.'
  }
});

const Mail = mongoose.models.Mail || mongoose.model('Mail', mailSchema);
module.exports = Mail;