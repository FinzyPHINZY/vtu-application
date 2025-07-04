import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import connectDB from './Config/Database.js';
import { startTransactionTimeoutJob } from './cron-jobs/palmpay.js';
import accountRoutes from './routes/account.js';
import analyticsRoutes from './routes/admin/analytics.js';
import productsRoutes from './routes/admin/products.js';
import systemControlRoutes from './routes/admin/systemControl.js';
import adminTransactionRoutes from './routes/admin/transactions.js';
import authRoutes from './routes/auth.js';
import depositRoutes from './routes/palmpay.js';
import servicesRoutes from './routes/services.js';
import transactionRoutes from './routes/transactions.js';
import transferRoutes from './routes/transfers.js';
import userRouter from './routes/user.js';
import billerRoutes from './routes/palmpay.biller.js';
import verificationRoutes from './routes/verification.js';
import { initialize } from './services/safeHavenAuth.js';
import { errorHandler, limiter, requestLogger } from './utils/middleware.js';
import { startQueues } from './workers/index.js';
import User from './models/User.js';
import { migrateKYCStatus } from './scripts/migrateKYCStatus.js';

// routes
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// migrateKYCStatus().catch(console.error);

// Database connection
connectDB();

// updated safe haven to palmpay service
// (async () => {
//   try {
//     await initialize();
//     console.log('Safe Haven Authentication initialized successfully');
//   } catch (error) {
//     console.error('Failed to initialize Safe Haven Authentication:', error);
//     process.exit(1);
//   }
// })();

// app.set("trust proxy", true);

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(limiter);
app.use(requestLogger);

// Endpoints
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bold Data - Bills Payment & Subscriptions</title>
        <meta name="description" content="Bold Data is your one-stop service for bills payment, airtime, and subscriptions.">
        <meta name="robots" content="index, follow">
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                text-align: center;
                padding: 50px;
            }
            h1 {
                color: #007bff;
                font-size: 2.5rem;
            }
            p {
                font-size: 1.2rem;
                margin-top: 10px;
            }
            .container {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                display: inline-block;
                max-width: 600px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome to Bold Data</h1>
            <p>Your one-stop service for bills payment and subscriptions.</p>
        </div>
    </body>
    </html>
  `);
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
app.use('/api/deposit', depositRoutes);
app.use('/api/biller', billerRoutes);

// admin endpoints
app.use('/api/admin/system-control', systemControlRoutes);
app.use('/api/admin/products', productsRoutes);
app.use('/api/admin/transactions', adminTransactionRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/system', systemControlRoutes);

app.post('/callback/payment', (req, res) => {
  console.log('req.body', req.body);

  console.log('webhook received');
  res.status(200).json({ success: true, message: 'Webhook received' });
});

// error handler
app.use(errorHandler);

// let depositVerificationJob;
// try {
//   depositVerificationJob = startDepositVerificationJob();
// } catch (error) {
//   console.error('Failed to start deposit verification job:', error);
// }

let transactionTimeoutJob;
try {
  transactionTimeoutJob = startTransactionTimeoutJob();
} catch (error) {
  console.error('Failed to start transaction timeout job:', error);
}

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  if (depositVerificationJob) {
    depositVerificationJob.stop();
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

app.listen(PORT, async () => {
  startQueues();

  console.log(
    `Server is running on http://localhost:${PORT} ...betta go catch it`
  );
});
