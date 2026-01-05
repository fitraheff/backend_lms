import express from 'express';
import userController from '../controllers/user-controller.js';
import auth from '../middlewares/auth-middlaware.js';

const userRoute = express.Router();

userRoute.get('/google-login', userController.googleLogin);
userRoute.get('/google-callback', userController.googleCallback);
userRoute.post('/login', userController.login);
userRoute.post('/register', userController.register);
userRoute.get('/me', auth.authMiddleware, userController.getById);
userRoute.get('/', auth.authMiddleware, userController.getAll);
userRoute.patch('/', auth.authMiddleware, userController.update);
userRoute.post('/logout', auth.authMiddleware, userController.logout);
userRoute.delete('/:id', auth.authMiddleware, auth.restrictTo('ADMIN'), userController.remove);
userRoute.post('/create-instructor', auth.authMiddleware, auth.restrictTo('ADMIN'), userController.createInstructor);
userRoute.post('/refresh-token', userController.refreshToken);

export default userRoute;