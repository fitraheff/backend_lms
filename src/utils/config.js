import 'dotenv/config';

export const config = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    databaseUrl: process.env.DATABASE_URL,
    accesTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    rateWindowMs: process.env.RATE_WINDOW_MS,
    rateLimit: process.env.RATE_LIMIT,
    frontendUrl: process.env.FRONTEND_URL,
}