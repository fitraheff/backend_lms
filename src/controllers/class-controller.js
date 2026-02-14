import classService from "../services/class-service";

const create = async (req, res, next) => {
    try {
        const instructorId = req.user.id;
        const data = req.body
        const result = await classService.create(data, instructorId);
        res.status(200).json({
            message: "Create class successful",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try {
        const instructorId = req.user.id;
        const moduleId = req.params.id;
        const result = await classService.update(req, moduleId, instructorId);
        res.status(200).json({
            message: "Update class successful",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const get = async (req, res, next) => {
    try {
        const moduleId = req.params.id;
        const result = await classService.get(moduleId);
        res.status(200).json({
            message: "Get class successful",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const search = async (req, res, next) => {
    try {
        const { keyword } = req.query;
        const result = await classService.search(keyword);
        res.status(200).json({
            // message: "Search class successful",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const remove = async (req, res, next) => {
    try {
        const instructorId = req.user.id;
        const moduleId = req.params.id;
        const result = await classService.remove(moduleId, instructorId);
        res.status(200).json({
            message: "Delete class successful",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const myModules = async (req, res, next) => {
    try {
        const instructorId = req.user.id;
        const result = await classService.myModules(instructorId);
        res.status(200).json({
            message: "Get my classes successful",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export default { create, update, get, search, remove, myModules };