import redis from 'redis';
import config from './config.js';
import { logger } from './logger.js';

class CacheService {
    constructor() {
        this.client = null; // tempat simpan koneksi Redis
        this.isReady = false; // status koneksi Redis

        this.redisConfig = {
            socket: {
                host: config.redisHost,
                port: config.redisPort,

                // KALAU PUTUS, COBA KONEK ULANG!
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        logger.error("Gagal konek Redis setelah 10 kali coba");
                        return new Error('Redis reconnection failed');
                    }
                    const delay = Math.min(retries * 500, 5000); // coba reconnect setiap 500ms, maksimal 3 detik
                    logger.warn(`Attempting to reconnect to Redis (#${retries + 1}) in ${delay}ms`);
                    return delay;
                }
            },
        }

        /*
        // Jika pakai password (Upstash, Redis Cloud, dll)
        if (config.redisPassword) {
            this.redisConfig.password = config.redisPassword;
        }

        // Jika pakai TLS (produksi wajib)
        if (config.redisTls) {
            this.redisConfig.socket.tls = true;
            this.redisConfig.socket.rejectUnauthorized = false; // untuk self-signed, prod sesuaikan
        }
        */
        this.#connect(); // mulai konek ke Redis
    }

    // Metode koneksi ke Redis
    async #connect() {
        try {
            this.client = redis.createClient(this.redisConfig);

            // Event listener
            this.client.on('error', (err) => {
                logger.error('Redis Client Error', { error: err.message });
                this.isReady = false;
            });

            this.client.on('ready', () => {
                logger.info('Redis client connected');
                this.isReady = true;
            });

            await this.client.connect(); // tunggu sampai koneksi berhasil
            logger.info('Berhasil konek ke Redis');
        } catch (err) {
            logger.error('Gagal konek ke Redis', err);
            throw err;
        }
    }

    // Metode untuk cek status koneksi
    // Getter biar bisa cek status
    getClient() {
        if (!this.isReady || !this.client) {
            throw new Error("Redis client not ready");
        }
        return this.client;
    }

    // Optional: method untuk operasi umum
    async get(key) {
        const client = this.getClient();
        return await client.get(key);
    }

    async set(key, value, ttlSeconds = 3600) {
        const client = this.getClient();
        await client.set(key, value, { EX: ttlSeconds });
    }

    async del(key) {
        const client = this.getClient();
        await client.del(key);
    }

    // Graceful shutdown
    async disconnect() {
        if (this.client && this.isReady) {
            await this.client.quit();
            logger.info("Redis client disconnected gracefully");
        }
    }
}

const cacheService = new CacheService();

export {
    cacheService
};