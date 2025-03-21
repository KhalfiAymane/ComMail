const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const app = express();

const startServer = async () => {
  await connectDB();

  app.use(express.json());
  const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.use(helmet());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use(limiter);

  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/mails', require('./routes/mailRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});