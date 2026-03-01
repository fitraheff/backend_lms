import enrollmentService from "../services/enrollment-service.js";

const enroll = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const classId = req.params.classId;
        const result = await enrollmentService.enroll(userId, classId);
        res.status(200).json({
            message: "Enroll class successful",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const getMyEnrollment = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const result = await enrollmentService.getMyEnrollment(userId); 
        res.status(200).json({
            message: "Get my enrollment successful",
            data: result
        });     
    } catch (e) {
        next(e);
    }
}

const cancelEnrollment = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const classId = req.params.classId;
        const result = await enrollmentService.cancelEnrollment(userId, classId);
        res.status(200).json({
            message: "Cancel enrollment successful",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export default { enroll, getMyEnrollment, cancelEnrollment };