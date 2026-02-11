import { prisma } from "../Application/prisma.js";
import { cache } from "../Application/cache.js";
import { ResponseError } from "../utils/response-error.js";
import { validate } from "../validations/validation.js";
import { Validation } from "../validations/module-validation.js";

const defaultModuleSelect = {
    id: true,
    title: true,
    desc: true,
    price: true,
    cover: true
}

const findModule = async (title, select = defaultModuleSelect) => {
    if (!title) {
        throw new ResponseError('title harus ada', 400)
    }

    const module = await prisma.module.findUnique({
        where: { title },
        select,
    })

    return module
}

const checkInstructorAndCategoryMustExist = async (instructorId, categoryId) => {
    const instructor = await prisma.user.findUnique({
        where: { id: instructorId },
        select: { id: true, role: true }
    })

    if (!instructor || instructor.role !== 'INSTRUCTOR') {
        throw new ResponseError('Instructor tidak valid', 403)
    }

    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true }
    })

    if (!category) {
        throw new ResponseError('Category tidak ditemukan', 404)
    }
}
const create = async (req, instructorId, categoryId) => {
    const data = validate(Validation.createModuleValidation, req)

    await checkInstructorAndCategoryMustExist(instructorId, categoryId)

    const module = await findModule({
        title: data.title,
        select: {
            title: true
        }
    })

    if (module) {
        throw new ResponseError("Module alredy exists", 400)
    }

    return await prisma.module.create({
        data: {
            title: data.title,
            desc: data.desc,
            price: data.price,
            cover: data.cover,
            instructorId,
            categoryId,
        }
    })
}

const update =async (req, moduleId, instructorId, categoryId) => {
    const data = validate(Validation.updateModuleValidation, req)

    await checkInstructorAndCategoryMustExist(instructorId, categoryId)

    const module = await findModule({
        where: {
            id: moduleId,
            // instructorId,
            // categoryId
        },
        select: {
            id: true,
            // instructorId: true,
            // categoryId: true
        }
    })

    if (!module) {
        throw new ResponseError("Module not found", 404)
    }

    return await prisma.module.update({
        where: {
            id: moduleId
        },
        data: {
            title: data.title,
            desc: data.desc,
            price: data.price,
            cover: data.cover,
            // instructorId,
            // categoryId
        },
        select: {
            id: true,
            title: true,
            desc: true,
            price: true,
            cover: true,
            // instructorId: true,
            // categoryId: true
        }
    })
}

