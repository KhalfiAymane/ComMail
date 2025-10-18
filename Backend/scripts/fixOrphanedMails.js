// scripts/fixOrphanedMails.js
const mongoose = require('mongoose');
const Mail = require('../models/Mail');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/your_db_name', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('Connection error:', err));

const fixOrphanedMails = async () => {
  try {
    const mails = await Mail.find();
    const users = await User.find();
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    for (const mail of mails) {
      let updated = false;
      if (mail.sender && !userMap.has(mail.sender.toString())) {
        mail.sender = null; // Or set to a default "deleted" user ID
        updated = true;
      }
      if (mail.archivedBy && !userMap.has(mail.archivedBy.toString())) {
        mail.archivedBy = null; // Or set to a default "deleted" user ID
        updated = true;
      }
      if (updated) {
        await mail.save();
        console.log(`Updated mail ${mail._id}`);
      }
    }
    console.log('Cleanup complete');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

fixOrphanedMails();