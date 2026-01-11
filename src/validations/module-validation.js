import joi from "joi";

const title = joi.string()
    .min(3)
    .max(255)
    .trim()
    .required()
    .messages({
        'string.min': 'Title minmal 3 karekter',
        'any.required': 'Title wajib diisi',
        'string.max': 'Title maksimal 255 karakter'
    })

const desc = joi.string()
    .min(3).max(1000)
    .trim()
    .required()
    .messages({
        'string.min': 'Description minmal 3 karekter',
        'any.required': 'Description wajib diisi',
        'string.max': 'Description maksimal 1000 karakter'
    })

const price = joi.number()
    .required()
    .integer()
    .trim()
    .messages({
        'any.required': 'Price wajib diisi',
        'number.base': 'Price harus berupa angka'
    })

const cover = joi.uri()
    .required()
    .messages({
        'any.required': 'Cover wajib diisi',
        'string.uri': 'Cover harus berupa URL'
    })

const createModuleValidation = joi.object({
    title: title,
    desc: desc,
    price: price,
    cover: cover
})

const updateModuleValidation = joi.object({
    title: title.optional(),
    desc: desc.optional(),
    price: price.optional(),
    cover: cover.optional()
})

export default {
    createModuleValidation,
    updateModuleValidation
}