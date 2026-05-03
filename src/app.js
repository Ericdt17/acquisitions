import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '#routes/auth.route.js';
import userRoutes from '#routes/user.route.js';


const app = express();
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { write: (message) => logger.info(message.trim()) }));
}


app.get('/', (req, res) => {
  logger.info('Hello from Acquisitions');
  res.status(200).send('Hello from Acquisitions API');
});



app.get('/api/health', (req, res) => {
  res.status(200).send( { status: 'OK', message: 'AcquisitionsAPI is running', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Acquisitions API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, _next) => {
  logger.error(err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Internal Server Error' : err.message });
});

export default app;
