// Backend/scripts/addUsers.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });

const users = [
  { 
    email: 'president@commune.org', 
    password: 'president123', 
    department: 'Présidence', 
    role: 'president', 
    permissions: ['create:courrier', 'read:courrier', 'update:courrier', 'delete:courrier', 'assign:courrier'] 
  },
  { 
    email: 'dgs@commune.org', 
    password: 'dgs123', 
    department: 'Direction Générale des Services', 
    role: 'dgs', 
    permissions: ['create:courrier', 'read:courrier', 'update:courrier', 'assign:courrier'] 
  },
  { 
    email: 'bo@commune.org', 
    password: 'bo123', 
    department: 'Bureau d’Ordre', // Fixed: Use ’ instead of '
    role: 'bo', 
    permissions: ['create:courrier', 'read:courrier', 'update:courrier'] 
  },
  { 
    email: 'sc@commune.org', 
    password: 'sc123', 
    department: 'Secrétariat du Conseil', 
    role: 'sc', 
    permissions: ['read:courrier', 'update:courrier'] 
  },
  { 
    email: 'sp@commune.org', 
    password: 'sp123', 
    department: 'Secrétariat du Président', 
    role: 'sp', 
    permissions: ['read:courrier', 'update:courrier'] 
  },
  { 
    email: 'rh@commune.org', 
    password: 'rh123', 
    department: 'Ressources Humaines', 
    role: 'rh', 
    permissions: ['create:courrier', 'read:courrier', 'update:courrier'] 
  },
  { 
    email: 'dfm@commune.org', 
    password: 'dfm123', 
    department: 'Division Financière', 
    role: 'dfm', 
    permissions: ['read:courrier', 'update:courrier'] 
  },
  { 
    email: 'dt@commune.org', 
    password: 'dt123', 
    department: 'Division Technique', 
    role: 'dt', 
    permissions: ['read:courrier', 'update:courrier'] 
  },
  { 
    email: 'bh@commune.org', 
    password: 'bh123', 
    department: 'Bureau d’Hygiène', // Fixed: Use ’ instead of '
    role: 'bh', 
    permissions: ['read:courrier', 'update:courrier'] 
  },
  { 
    email: 'pc@commune.org', 
    password: 'pc123', 
    department: 'Partenariat et Coopération', 
    role: 'pc', 
    permissions: ['read:courrier', 'update:courrier'] 
  },
  { 
    email: 'ic@commune.org', 
    password: 'ic123', 
    department: 'Informatique et Communication', 
    role: 'ic', 
    permissions: ['read:courrier', 'update:courrier'] 
  },
  { 
    email: 'admin@commune.org', 
    password: 'admin123', 
    department: 'Administration', 
    role: 'admin', 
    permissions: ['create:courrier', 'read:courrier', 'update:courrier', 'delete:courrier', 'assign:courrier', 'manage:users'] 
  }
];

const importUsers = async () => {
  try {
    await User.deleteMany();
    const createdUsers = [];
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      const newUser = await User.create({
        email: user.email,
        password: hashedPassword,
        department: user.department,
        role: user.role,
        permissions: user.permissions,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      createdUsers.push(newUser);
    }
    console.log('Department accounts imported successfully!');
    console.table(createdUsers.map(user => ({
      email: user.email,
      department: user.department,
      role: user.role,
      permissions: user.permissions.join(', '),
      status: user.status
    })));
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importUsers();