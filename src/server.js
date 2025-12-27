import { App } from './Application/app.js';
import { config } from './utils/config.js';
import { logger } from './Application/logging.js';
import { prisma } from './Application/prisma.js';

const PORT = config.port;

// ====== STARTUP TIMER ======
console.time("Startup");

// ====== DB CONNECT (REAL) ======
console.time("Database");
await prisma.$connect();
console.timeEnd("Database");

console.timeLog("Startup", "Database connected");

App.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Environment: ${config.env}`);
    console.timeEnd("Startup");
});