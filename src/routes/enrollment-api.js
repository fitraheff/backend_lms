import express from 'express';
import enrollmentControll from '../controllers/enrollment-controller.js';
import auth from '../middlewares/auth-middlaware.js';

const enrollmentRoute = express.Router();

enrollmentRoute.post('/:classId', auth.authMiddleware, enrollmentControll.enroll);
enrollmentRoute.get('/me', auth.authMiddleware, auth.restrictTo('STUDENT'), enrollmentControll.getMyEnrollment);
enrollmentRoute.delete('/:classId', auth.authMiddleware, auth.restrictTo('STUDENT'), enrollmentControll.cancelEnrollment);

export default enrollmentRoute