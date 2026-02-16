import { prisma } from "../Application/prisma.js";
import { ResponseError } from "../utils/response-error.js";

const enroll = async (userId, classId) => {
    const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_classId: { studentId: userId, classId } },
    });

    if (enrollment) {
        throw new ResponseError("User already enrolled", 400);
    }

    return await prisma.enrollment.create({
        data: {
            studentId: userId,
            classId,
        },
        select: {
            id: true,
            classId: true,
            studentId: true,
            status: true,
            enrolledAt: true,
        }
    });
}

const getMyEnrollment = async (userId) => {
   const enrollments = await prisma.enrollment.findMany({
        where: { studentId: userId },
        select: {
            id: true,
            status: true,
            // classId: true,
            // studentId: true,
            enrolledAt: true,
            class: {
                select: {
                    id: true,
                    title: true,
                    desc: true,
                    cover: true,
                },
                instruktor: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            category: {
                select: {
                    id: true,
                    title: true
                }
            },
            level: true
        }
    });

    if (!enrollments || enrollments.length === 0) {
        throw new ResponseError("No enrollments found", 404);
    }

    return enrollments;
}

const cancelEnrollment = async (userId, classId) => {
    const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_classId: { studentId: userId, classId } },
    });

    if (!enrollment) {
        throw new ResponseError("Enrollment not found", 404);
    }

    return await prisma.enrollment.delete({
        where: { studentId_classId: { studentId: userId, classId } },
        select: {
            id: true,
            status: true,
            canceledAt: true,
        }
    });
}

export default {
    enroll,
    getMyEnrollment,
    cancelEnrollment
}