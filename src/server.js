import { App } from './Application/app.js';
import { config } from './utils/config.js';
import { logger } from './Application/logging.js';
import { prisma } from './Application/prisma.js';
import { cache } from './Application/cache.js';

const PORT = config.port;

// ====== STARTUP TIMER ======
console.time("Startup");

// 1. Database Connect
await prisma.$connect();
logger.info("Database connected");

// 2. Redis Connect
await cache.connect();
logger.info("Cache service initialized");

const server = App.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Environment: ${config.env}`);
    console.timeEnd("Startup");
});

// ====== GRACEFUL SHUTDOWN ======
// Taruh di paling bawah, setelah server.listen()
const shutdown = async (signal) => {
    logger.info(`${signal} received: shutting down gracefully`);

    // 1. Tutup server HTTP (stop terima request baru)
    server.close(async () => {
        logger.info("HTTP server closed");

        // 2. Tutup koneksi Prisma
        await prisma.$disconnect();

        // 3. Tutup Redis kalau pakai
        await cache.disconnect();

        logger.info("Graceful shutdown complete");
        process.exit(0);
    });

    // Force close kalau lama (10 detik)
    setTimeout(() => {
        logger.error("Force shutdown (timeout)");
        process.exit(1);
    }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));