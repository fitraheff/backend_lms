import 'dotenv/config';

export const config = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,

    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    
    baseUrl: process.env.BASE_URL,
    databaseUrl: process.env.DATABASE_URL,

    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRATION,

    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,

    rateWindowMs: process.env.RATE_WINDOW_MS,
    rateLimit: process.env.RATE_LIMIT,

    frontendUrl: process.env.FRONTEND_URL,
}