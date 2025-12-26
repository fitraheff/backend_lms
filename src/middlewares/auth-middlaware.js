import { prisma } from '../Application/prisma.js';
import { ResponseError } from '../utils/response-error.js';
import tokenjwt from '../utils/jwt.js';

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new ResponseError('Authorized: No token provided', 401);
        }
        const token = authHeader.split(' ')[1];

        const data = tokenjwt.verifyAccessToken(token);

        const user = await prisma.user.findUnique({
            where: { id: data.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        })

        if (!user) {
            throw new ResponseError('Authorized: User not found or token invalid', 401);
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof ResponseError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}

const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        next();
    }
}

export default {
    authMiddleware,
    restrictTo
}