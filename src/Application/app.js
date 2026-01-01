import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from '../utils/config.js';
import { limiter } from '../utils/rate-limiter.js';
import { errorMiddleware } from '../middlewares/error-middlaware.js';
import { morganMiddleware } from '../middlewares/morgan-middlaware.js';
import { logger } from '../Application/logging.js';

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

// ===== REQUEST TIMING MIDDLEWARE =====
App.use((req, res, next) => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;

        // const uptime = Date.now() - global.__BOOT_TIME__;
        // const isCold = uptime < 5000;

        logger.info("HTTP Request", {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            duration: `${durationMs.toFixed(2)}ms`,
            // coldStart: isCold,
        });

        if (durationMs > 500) {
            logger.warn("Slow request detected", {
                path: req.originalUrl,
                duration: `${durationMs.toFixed(2)}ms`,
            });
        }
    });

    next();
});

App.get('/health', (_, res) => {
    res.status(200).send('OK');
});

// Routes
App.use('/api/V1/users', userRoute);

App.use(errorMiddleware)

