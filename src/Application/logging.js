import winston from 'winston';

// Format yang lebih readable di development, JSON di production
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
    })
);

const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: fileFormat,
    transports: [
        // Always log to file
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" }),

        // Console hanya di non-production atau kalau di-force
        ...(process.env.NODE_ENV !== "production"
            ? [new winston.transports.Console({ format: consoleFormat })]
            : []),
    ],
});

// logger.info('Information message');
// logger.error('Error message');

export default logger;