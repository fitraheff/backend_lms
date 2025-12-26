import Joi from "joi";

const username = Joi.string()
    .min(3)
    .max(100)
    .trim()
    // .required()
    .messages({
        'string.min': 'name minimal 3 karakter',
        'any.required': 'name wajib diisi',
    });

const email = Joi.string()
    .email({ tlds: { allow: ['com', 'org', 'net'] } })
    .lowercase()
    .trim()
    .max(255)
    // .required()
    .messages({
        'string.email': 'Email tidak valid',
        'any.required': 'Email wajib diisi',
    });

const password = Joi.string()
    .min(6)
    // .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
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
    password: password.optional(),
})

const getUserValidation = Joi.string().max(100).required();

const updateUserValidation = Joi.object({
    name: username.optional(),
    email: email.optional(),
    password: password.optional(),
    currentPassword: Joi.string()
        .min(6)
        .when("password", {
            is: Joi.exist().not(null),
            then: Joi.required().messages({
                "any.required": "Current password wajib diisi untuk mengganti password baru",
            }),
            otherwise: Joi.forbidden(),
        }),
})
    .or("name", "email", "password") // minimal salah satu field ini ada
    .unknown(false) // blokir field yang tidak didefinisikan
    .messages({
        "object.min": "Minimal harus mengisi satu field untuk update",
        "object.unknown": "Field {{key}} tidak diizinkan",
    });

const createInstructorValidation = Joi.object({
    name: username.required(),
    email: email.required(),
    password: password.required(),
})


export {
    loginUserValidation,
    registerUserValidation,
    getUserValidation,
    updateUserValidation,
    createInstructorValidation
}