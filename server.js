import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import userRouter from './routes/user.js';
import { errorHandler, limiter, requestLogger } from './utils/middleware.js';
import connectDB from './Config/Database.js';
import servicesRoutes from './routes/services.js';
import authRoutes from './routes/auth.js';
import verificationRoutes from './routes/verification.js';
import accountRoutes from './routes/account.js';
import transactionRoutes from './routes/transactions.js';
import transferRoutes from './routes/transfers.js';
import { initialize } from './services/safeHavenAuth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// Database connection
connectDB();

(async () => {
  try {
    await initialize();
    console.log('Safe Haven Authentication initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Safe Haven Authentication:', error);
    // process.exit(1);
  }
})();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(requestLogger);

// Endpoints
app.get('/', async (req, res) => {
  res
    .status(200)
    .send(
      'Welcome to Bold Data. Your one-stop service for Bills Payment and Subscriptions. '
    );
});

// health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    message: 'Server running properly...',
    timestamp: new Date().toISOString(),
  });
});

// middleware endpoints
app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);
app.use('/api/verification', verificationRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transfers', transferRoutes);

// error handler
app.use(errorHandler);

// Start the server and log a message to the console upon successful start
app.listen(PORT, () => {
  console.log(
    `Server is running on http://localhost:${PORT} ...betta go catch it`
  );
});
