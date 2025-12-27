import bcrypt from 'bcrypt';
import { google } from 'googleapis';

import { prisma } from "../Application/prisma.js";
import tokenjwt from "../utils/jwt.js";
// import { verifyRefreshToken } from "../utils/jwt.js";
import { ResponseError } from "../utils/response-error.js";
import { config } from "../utils/config.js";
import { validate } from "../validations/validation.js";
import {
    registerUserValidation,
    loginUserValidation,
    getUserValidation,
    updateUserValidation,
    createInstructorValidation,
    setPasswordValidation
} from '../validations/user-validation.js';

const defaultUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    // createdAt: true,
    // updatedAt: true,
};

const findUser = async ({ id, email, select = defaultUserSelect }) => {
    if (!id && !email) {
        throw new ResponseError("id atau email harus disediakan", 400);
    }

    const user = await prisma.user.findUnique({
        where: id ? { id } : { email },
        select,
    });

    // if (!user) throw new ResponseError("User tidak ditemukan", 404);
    return user;
};

const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.env === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

const clearRefreshTokenCookie = (res) => {
    res.clearCookie("refreshToken");
};

// Google OAuth Setup
const oauth2Client = new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    `${config.baseUrl}/api/users/google-callback` // gunakan config, bukan hardcode localhost
);

const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
];

const getGoogleLoginUrl = () => {
    return oauth2Client.generateAuthUrl({
        access_type: "offline", // Biar dapet "kunci cadangan" (refresh token) untuk akses kapan saja
        prompt: "consent",      // Paksa munculin layar izin supaya refresh token selalu dikirim ulang
        scope: scopes,          // Daftar izin data apa saja yang boleh diakses aplikasi
        include_granted_scopes: true // Sertakan izin yang sudah pernah diberikan sebelumnya
    });
};

// GOOGLE callback login
const googleCallback = async (code, res) => {
    if (!code) throw new ResponseError("No code provided", 400);

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const { data } = await oauth2.userinfo.get();

    if (!data.email || !data.id) {
        throw new ResponseError("Failed to get user info from Google", 400);
    }

    // Cari user berdasarkan googleId atau email
    let user = await prisma.user.findUnique({
        where: { googleId: data.id }
    });

    if (!user) {
        user = await prisma.user.findUnique({
            where: { email: data.email },
        });
    }

    // Jika user tidak ditemukan
    if (!user) {
        // Buat user baru
        user = await prisma.user.create({
            data: {
                email: data.email,
                name: data.name || data.email.split("@")[0],
                emailVerified: data.verified_email || false,
                googleId: data.id,
                role: "STUDENT", // default role
            },
        });
    } else if (!user.googleId) {
        // Update googleId kalau belum ada (link account)
        user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId: data.id },
        });
    }

    // Generate token SAMA seperti login biasa
    const accessToken = tokenjwt.generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = tokenjwt.generateRefreshToken({ id: user.id });

    // Simpan hashed refresh token di DB (untuk revoke nanti)
    await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken: await bcrypt.hash(refreshToken, 10)
        },
    });

    // Set httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    return {
        accessToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
    };
};

const login = async (req, res) => {
    const { email, password } = validate(loginUserValidation, req);

    const user = await findUser({
        email: email,
        select: {
            ...defaultUserSelect,
            password: true,
            googleId: true
        },
    })

    // User tidak ditemukan
    if (!user) {
        throw new ResponseError("Email atau password salah", 401);
    }

    // OAuth-only user
    if (user.googleId && !user.password) {
        throw new ResponseError(
            "Akun ini terdaftar via Google. Silakan login menggunakan Google.",
            400
        );
    }

    // Safety guard (seharusnya tidak kejadian)
    if (!user.password) {
        throw new ResponseError("Password belum diset", 400);
    }

    // Password check
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new ResponseError("Email atau password salah", 401);
    }

    const accessToken = tokenjwt.generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = tokenjwt.generateRefreshToken({ id: user.id });

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: await bcrypt.hash(refreshToken, 10) },
    });

    // Set cookie refresh token
    setRefreshTokenCookie(res, refreshToken);

    return {
        accessToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
}

// Registrasi user/student baru
const register = async (req) => {
    const data = validate(registerUserValidation, req);

    const user = await findUser({
        email: data.email,
        select: { email: true }
    });

    if (user) {
        throw new ResponseError("email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    return await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: 'STUDENT',
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });
}

const getById = async (req) => {
    const id = validate(getUserValidation, req);

    const user = await findUser({
        id,
        select: defaultUserSelect
    });

    if (!user) {
        throw new ResponseError("user is not found", 404);
    }

    return user;
}

const getAll = async () => {
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });
}

const update = async (userId, req) => {
    const data = validate(updateUserValidation, req);

    const user = await findUser({
        id: userId,
        select: {
            ...defaultUserSelect,
            password: true,
            updatedAt: true,
        }
    });

    if (!user) {
        throw new ResponseError("user is not found", 404);
    }

    const dataToUpdate = {};

    if (data.name) dataToUpdate.name = data.name;
    if (data.email) dataToUpdate.email = data.email;

    if (data.password) {
        if (!user.password) {
            throw new ResponseError(
                "Akun ini belum memiliki password. Gunakan set password.",
                400
            );
        }

        if (!data.currentPassword) {
            throw new ResponseError("Current password wajib diisi", 400);
        }

        const valid = await bcrypt.compare(
            data.currentPassword,
            user.password
        );

        if (!valid) {
            throw new ResponseError("Password saat ini salah", 400);
        }
        dataToUpdate.password = await bcrypt.hash(data.password, 12);
    }

    return prisma.user.update({
        where: {
            id: userId
        },
        data: dataToUpdate,
        select: {
            id: true,
            name: true,
            email: true,
            updatedAt: true,
        }
    })
}

const remove = async (id) => {
    const user = await findUser({
        id,
        select: {
            id: true
        }
    });

    if (!user) {
        throw new ResponseError("user is not found", 404);
    }

    return prisma.user.delete({
        where: {
            id: id
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        }
    });
}

// pake http-only cookie
const logout = async (refreshToken, res) => {
    if (!refreshToken) {
        clearRefreshTokenCookie(res);
        return;
    }
    // Cari user yang punya refreshToken ini (hashed)
    const users = await prisma.user.findMany({
        where: { refreshToken: { not: null } },
        select: { id: true, refreshToken: true },
    });

    for (const user of users) {
        const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
        if (isMatch) {
            await prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: null },
            });
            break;
        }
    }

clearRefreshTokenCookie(res);
};

const createInstructor = async (req) => {
    // authenticate + restrictTo("ADMIN") di route

    const data = validate(createInstructorValidation, req); // { name, email }

    const existingUser = await findUser({
        email: data.email,
        select: { email: true }
    });

    if (existingUser) {
        throw new ResponseError("Email sudah terdaftar", 400);
    }

    // Optional: generate random password & kirim email invite
    // const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword, // atau null kalau force Google login
            role: "INSTRUCTOR",
            emailVerified: true, // karena dibuat admin
        },
    });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        // temporaryPassword: tempPassword, // hanya di dev, matikan di prod
    };
};

const refreshToken = async (refreshToken, res) => {
    if (!refreshToken) throw new ResponseError("Refresh token required", 401);

    let payload;
    try {
        payload = tokenjwt.verifyRefreshToken(refreshToken);
    } catch {
        throw new ResponseError("Invalid or expired refresh token", 401);
    }

    const userId = payload.id || payload.userId;
    if (!userId) {
        throw new ResponseError("Invalid refresh token payload", 401);
    }

    const user = await findUser({
        id: userId,
        select: {
            id: true,
            refreshToken: true,
            role: true
        }
    });

    if (!user || !user.refreshToken) {
        throw new ResponseError("Invalid refresh token", 401);
    }

    // Verify hashed token di DB
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new ResponseError("Invalid refresh token", 401);

    const newAccessToken = tokenjwt.generateAccessToken({ id: user.id, role: user.role });
    // Optional: rotate refresh token
    const newRefreshToken = tokenjwt.generateRefreshToken({ id: user.id });

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: await bcrypt.hash(newRefreshToken, 10) },
    });

    // Set httpOnly cookie
    setRefreshTokenCookie(res, newRefreshToken);

    return {
        id: user.id,
        accessToken: newAccessToken,
        role: user.role
    };
};

const setPassword = async (req, userId) => {
    const { password } = validate(setPasswordValidation, req.body);

    const user = await findUser({
        id: userId,
        select: { id: true, password: true, googleId: true },
    });

    if (!user) {
        throw new ResponseError("User tidak ditemukan", 404);
    }

    if (user.password) {
        throw new ResponseError(
            "Password sudah disetel. Gunakan menu ganti password.",
            400
        );
    }

    if (!user.googleId) {
        throw new ResponseError(
            "Fitur ini hanya untuk akun yang terdaftar via Google.",
            400
        );
    }

    const hashed = await bcrypt.hash(password, 12);

    return prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
        select: {
            id: true,
            email: true,
        }
    });
};



export default {
    getGoogleLoginUrl,
    googleCallback,
    register,
    createInstructor,
    login,
    getById,
    getAll,
    update,
    remove,
    logout,
    refreshToken,
    setPassword
}