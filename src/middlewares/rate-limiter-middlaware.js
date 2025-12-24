import { rateLimit } from 'express-rate-limit'
import { config } from '../utils/config.js'

const limiter = rateLimit({
    windowMs: config.rateWindowMs, // 15 minutes
    limit: config.rateLimit, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: {
        status: 429,
        error: 'Too many requests from this IP address',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
})

export { limiter }