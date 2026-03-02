import express from 'express'
import moduleController from '../controllers/module-controllers.js'
import auth from '../middlewares/auth-middlaware.js';

const moduleRoute = express.Router()

moduleRoute.post('/:classId', auth.authMiddleware, auth.restrictTo('ADMIN', 'INSTRUCTOR'), moduleController.create)
moduleRoute.patch('/:id', auth.authMiddleware, auth.restrictTo('ADMIN', 'INSTRUCTOR'), moduleController.update)
moduleRoute.delete('/:id', auth.authMiddleware, auth.restrictTo('ADMIN', 'INSTRUCTOR'), moduleController.remove)
moduleRoute.get('/class/:classId', auth.authMiddleware, moduleController.getModuleByClassId)
moduleRoute.get('/:id', auth.authMiddleware, moduleController.getModuleById)

export default moduleRoute