import express from 'express';
import classController from '../controllers/class-controller.js';
import auth from '../middlewares/auth-middlaware.js';

const classRoute = express.Router();

classRoute.post('/', auth.authMiddleware, auth.restrictTo('ADMIN', 'INSTRUCTOR'), classController.create);
classRoute.patch('/:id', auth.authMiddleware, auth.restrictTo('ADMIN', 'INSTRUCTOR'), classController.update);
classRoute.get('/search', auth.authMiddleware, classController.search);
classRoute.get('/:id', auth.authMiddleware, classController.get);
classRoute.delete('/:id', auth.authMiddleware, auth.restrictTo('ADMIN', 'INSTRUCTOR'), classController.remove);
classRoute.get('/me', auth.authMiddleware, classController.myModules);

export default classRoute;