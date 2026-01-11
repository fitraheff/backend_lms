import Joi from "joi";

const username = Joi.string()
    .required()
    .min(3)
    .max(100)
    .trim()
    .messages({
        'string.min': 'name minimal 3 karakter',
        'any.required': 'name wajib diisi',
    });

const email = Joi.string()
    .required()
    .email({ tlds: { allow: ['com', 'org', 'net'] } })
    .lowercase()
    .trim()
    .max(255)
    .messages({
        'string.email': 'Email tidak valid',
        'any.required': 'Email wajib diisi',
    });

const password = Joi.string()
    .required()
    .trim()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
        'any.required': 'Password wajib diisi',
        'string.min': 'Password minimal 6 karakter',
        'string.pattern.base': 'Password harus mengandung huruf besar, huruf kecil, dan angka',
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

const getUserValidation = Joi.string()
    .max(100)
    .required()
    .messages({
        'any.required': 'ID user wajib diisi',
        'string.max': 'ID user terlalu panjang',
    });

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
    name: username,
    email: email,
    password: password,
})

const setPasswordValidation = Joi.object({
    password: password.required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        "any.only": "Password dan confirm password harus sama",
        "any.required": "Confirm password wajib diisi",
    }),
});


export {
    loginUserValidation,
    registerUserValidation,
    getUserValidation,
    updateUserValidation,
    createInstructorValidation,
    setPasswordValidation
}