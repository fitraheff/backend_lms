import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { logger } from "./logging.js";
import { config } from "../utils/config.js";

const connectionString = `${config.databaseUrl}`;

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({
    adapter,
    log: [
        config.env === "development"
            ? ["query", "info", "warn", "error"]
            : ["warn", "error"],
    ],
})

prisma.$on("query", (e) => {
    logger.debug("Prisma Query", {
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`,
    });
});

prisma.$on("info", (e) => logger.info("Prisma Info", { message: e.message }));
prisma.$on("warn", (e) => logger.warn("Prisma Warn", { message: e.message }));
prisma.$on("error", (e) => logger.error("Prisma Error", { message: e.message }));

export { prisma }