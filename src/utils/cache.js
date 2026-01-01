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
                    if (retries > 10) return new Error("Redis reconnect failed");
                    return Math.min(retries * 500, 5000);
                },
            },
        });

        this.client.on('ready', () => logger.info("Redis connected"));
        this.client.on('error', err =>
            logger.error("Redis error", { message: err.message })
        );
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