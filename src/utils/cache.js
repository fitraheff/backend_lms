import redis from 'redis';
import config from './config.js';
import { logger } from './logger.js';

class CacheService {
    constructor() {
        this.client = redis.createClient({
            socket: {
                host: config.redisHost,
                port: config.redisPort,
                reconnectStrategy: retries => {
                    if (retries > 5) {
                        logger.error("Redis reconnect failed");
                        return false; // stop retry
                    }
                    return Math.min(retries * 1000, 5000);
                },
            },
        });

        this.isReady = false;

        this.client.on("ready", () => {
            this.isReady = true;
            logger.info("Redis connected");
        });

        this.client.on("end", () => {
            this.isReady = false;
            logger.warn("Redis connection closed");
        });

        this.client.on("error", (err) => {
            this.isReady = false;
            logger.error("Redis error", { message: err.message });
        });
    }

    async connect() {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
    }

    async get(key) {
        return this.client.get(key);
    }

    async set(key, value, ttl = 3600) {
        await this.client.set(key, value, { EX: ttl });
    }

    async del(key) {
        await this.client.del(key);
    }

    async disconnect() {
        if (this.client.isOpen) {
            await this.client.quit();
            logger.info("Redis disconnected");
        }
    }
}

export const cache = new CacheService();