import jwt from 'jsonwebtoken';
import { config } from '../utils/config.js';
import { ResponseError } from './response-error.js';
// import { UnauthorizedError } from '../errors/UnauthorizedError.js';

export const generateToken = (data, access = true) => {
    const secret = access
        ? config.accesTokenSecret
        : config.refreshTokenSecret;
    const expiry = access
        ? config.accessTokenExpiresIn
        : config.refreshTokenExpiresIn;
    return jwt.sign(data, secret, { expiresIn: parseInt(expiry) });
};

export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, config.accesTokenSecret);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new ResponseError('Token expired', 401);
        }
        if (err.name === 'JsonWebTokenError') {
            throw new ResponseError('Invalid token', 401);
        }
        throw new ResponseError('Invalid or expired access token", 401');
    }
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, config.refreshTokenSecret);
    } catch {
        throw new ResponseError('Invalid or expired refresh token", 401');
    }
};