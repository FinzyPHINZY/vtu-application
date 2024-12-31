import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helment from 'helmet';
import cors from 'cors';
import userRouter from './routes/userRouter.js';
import { requestLogger } from './utils/middleware.js';
import connectDB from './Config/Database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// Database connection
connectDB();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(helment());
app.use(cors());
app.use(requestLogger);

// Endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    message: 'Server running properly...',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/user', userRouter);

// Start the server and log a message to the console upon successful start
app.listen(PORT, () => {
  console.log(
    `Server is running on http://localhost:${PORT} ...betta go catch it`
  );
});
