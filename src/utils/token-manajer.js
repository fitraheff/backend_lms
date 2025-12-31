import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { ResponseError } from './response-error.js';
// import { UnauthorizedError } from '../errors/UnauthorizedError.js';

const generateAccessToken = (payload) => {
    return jwt.sign(payload, config.accessTokenSecret, { expiresIn: config.accessTokenExpiresIn });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, config.refreshTokenSecret, { expiresIn: config.refreshTokenExpiresIn });
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, config.accessTokenSecret);
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

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, config.refreshTokenSecret);
    } catch {
        throw new ResponseError('Invalid or expired refresh token", 401');
    }
};

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};