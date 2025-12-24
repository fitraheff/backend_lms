import { prisma } from '../Application/prisma.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { ResponseError } from '../utils/response-error.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            throw new ResponseError('Unauthorized: Access token required', 401);
        }

        const data = verifyAccessToken(token);

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

export const restrictTo = (...allowedRoles) => {
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