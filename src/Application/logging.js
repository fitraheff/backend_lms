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
    // defaultMeta: { service: "lms-api" },
    // format: fileFormat,
    transports: [
        // Always log to file
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: fileFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
            zippedArchive: true,
        }),
        new winston.transports.File({
            filename: "logs/combined.log",
            format: fileFormat,
            maxsize: 20 * 1024 * 1024, // 10MB
            maxFiles: 5,
            zippedArchive: true,
        }),

        // Console hanya di non-production atau kalau di-force
        ...(process.env.NODE_ENV !== "production"
            ? [new winston.transports.Console({ format: consoleFormat })]
            : []),
    ],
});

export {
    logger
};