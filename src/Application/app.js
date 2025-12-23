import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from '../utils/config';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { errorMiddleware } from '../middlewares/error-middlaware.js';

export const App = express();
App.use(express.json());
App.use(cookieParser());
App.use(helmet());
App.use(cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}))
App.use(rateLimiter)

App.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Routes
App.use('api/users', /* userRoutes */);

App.use(errorMiddleware)

