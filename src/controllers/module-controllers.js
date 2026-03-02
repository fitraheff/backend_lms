import moduleService from '../services/module-service.js';

const create = async (req, res, next) => {
    try {
        // const instructorId = req.user.id;
        const classId = req.params.classId;
        const result = await moduleService.create(req.body, classId);
        res.status(200).json({
            message: "Create module successful",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try {
        const moduleId = req.params.id;
        const result = await moduleService.update(req, moduleId);
        res.status(200).json({
            message: "Update module successful",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const remove = async (req, res, next) => {
    try {
        const moduleId = req.params.id;
        const result = await moduleService.remove(moduleId);
        res.status(200).json({
            message: "Delete module successful",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const getModuleByClassId = async (req, res, next) => {
    try {
        const classId = req.params.classId;
        const result = await moduleService.getModuleByClassId(classId);
        res.status(200).json({
            message: "Get module by class id successful",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const getModuleById = async (req, res, next) => {
    try {
        const moduleId = req.params.id;
        const result = await moduleService.getModuleById(moduleId);
        res.status(200).json({
            message: "Get module by id successful",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export default {
    create,
    update,
    remove,
    getModuleByClassId, 
    getModuleById
}