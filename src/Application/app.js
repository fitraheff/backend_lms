import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from '../utils/config.js';
import { limiter } from '../utils/rate-limiter.js';
import { errorMiddleware } from '../middlewares/error-middlaware.js';
import { morganMiddleware } from '../middlewares/morgan-middlaware.js';

import userRoute from '../routes/user-api.js';

export const App = express();

// ===== BOOT TIME (COLD START DETECTOR) =====
// global.__BOOT_TIME__ = Date.now();

App.use(helmet());

App.use(cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}))

App.use(express.json());
App.use(cookieParser());
App.use(morganMiddleware)
App.use(limiter)

App.get('/health', (_, res) => {
    res.status(200).send('OK');
});

// Routes
App.use('/api/V1/users', userRoute);

App.use(errorMiddleware)

