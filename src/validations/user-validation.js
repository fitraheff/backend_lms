import Joi from "joi";

const username = Joi.string()
    .min(3)
    .max(100)
    .trim()
    .required()
    .messages({
        'string.min': 'name minimal 3 karakter',
        'any.required': 'name wajib diisi',
    });

const email = Joi.string()
    .email({ tlds: { allow: ['com', 'org', 'net'] } })
    .lowercase()
    .trim()
    .max(255)
    .required()
    .messages({
        'string.email': 'Email tidak valid',
        'any.required': 'Email wajib diisi',
    });

const password = Joi.string()
    .min(6)
    .max(100)
    .required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])?[A-Za-z\\d@$!%*?&]{8,}$'))
    .message({
        'string.pattern.base': 'Password harus mengandung huruf besar, huruf kecil, dan angka',
        'string.min': 'Password minimal 6 karakter'
    });

const registerUserValidation = Joi.object({
    name: username,
    email: email,
    password: password,
    // confirmPassword: Joi.string().valid(Joi.ref('password')).required()
})

const loginUserValidation = Joi.object({
    email: email,
    password: password
})

const getUserValidation = Joi.string().max(100).required();

const updateUserValidation = Joi.object({
    email: email.optional(),
    name: username.optional(),
    password: password.optional(),
    newPassword: Joi.alternatives().conditional('password', {
        is: Joi.exist(),
        then: password.invalid(Joi.ref('password')),
        otherwise: Joi.forbidden()
    }),
}).with('password', 'newPassword') // Pastikan keduanya ada bersama
    .strict(); // Tolak properti yang tidak terdefinisi


export {
    loginUserValidation,
    registerUserValidation,
    getUserValidation,
    updateUserValidation,
}