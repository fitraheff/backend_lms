import { prisma } from "../Application/prisma.js";
import { ResponseError } from "../utils/response-error.js";
import { validate } from "../validations/validation.js";
import Validation from "../validations/module-validation.js";

const defaultModuleSelect = {
    id: true,
    title: true,
    desc: true,
    file_url: true,
    type: true
}

const findModule = async (title, select = defaultModuleSelect) => {
    if (!title) {
        throw new ResponseError('title harus ada', 400)
    }

    const module = await prisma.moduleContent.findFirst({
        where: { title },
        select,
    })

    return module
}

const getModuleByClassId = async (classId) => {
    const modules = await prisma.moduleContent.findMany({
        where: { classId },
        select: defaultModuleSelect
    })

    if (!modules || modules.length === 0) {
        throw new ResponseError('Modules not found', 404)
    }

    return modules
}

const getModuleById = async (id) => {
    const module = await prisma.moduleContent.findUnique({
        where: { id },
        select: defaultModuleSelect
    })

    if (!module) {
        throw new ResponseError('Module not found', 404)
    }

    return module
}

const create = async (req, classId) => {
    const data = validate(Validation.createModuleValidation, req)

    const module = await findModule(data.title)

    if (module) {
        throw new ResponseError("Module alredy exists", 400)
    }

    return await prisma.moduleContent.create({
        data: {
            title: data.title,
            desc: data.desc,
            file_url: data.file_url,
            type: data.type,
            moduleId: classId
        }
    })
}


const update = async (req, moduleId) => {
    const data = validate(Validation.updateModuleValidation, req)

    const module = await getModuleById(moduleId)

    if (!module) {
        throw new ResponseError("Module not found", 404)
    }

    return await prisma.moduleContent.update({
        where: {
            id: moduleId
        },
        data: {
            title: data.title,
            desc: data.desc,
            type: data.type
        }
    })
}

const remove = async (moduleId) => {
    const module = await prisma.moduleContent.findUnique({
        where: { id: moduleId }
    })

    if (!module) {
        throw new ResponseError("Module not found", 404)
    }

    return prisma.module.delete({
        where: { id: moduleId }
    })
}

export default {
    create,
    update,
    remove,
    getModuleByClassId,
    getModuleById
}

