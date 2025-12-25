import bcrypt from 'bcrypt';
import { google } from 'googleapis';

import { prisma } from "../Application/prisma.js";
import { generateToken } from "../utils/jwt.js";
import { verifyRefreshToken } from "../utils/jwt.js";
import { ResponseError } from "../utils/response-error.js";
import { config } from "../utils/config.js";
import { validate } from "../validations/validation.js";
import {
    registerUserValidation,
    loginUserValidation,
    getUserValidation,
    updateUserValidation,
    createInstructorValidation
} from '../validations/user-validation.js';

const defaultUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
};

const findUser = async ({ id, email, select = defaultUserSelect }) => {
    if (!id && !email) {
        throw new Error("id atau email harus disediakan");
    }

    return prisma.user.findUnique({
        where: id ? { id } : { email },
        select, // kalau undefined → ambil default Prisma (semua field)
    });
};



// Google OAuth Setup
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${config.baseUrl}/auth/google/callback` // gunakan config, bukan hardcode localhost
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
    });
};

// GOOGLE callback login
const googleCallback = async (code) => {
    if (!code) throw new ResponseError("No code provided", 400);

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const { data } = await oauth2.userinfo.get();

    if (!data.email || !data.name) {
        throw new ResponseError("Failed to get user info from Google", 400);
    }

    // Cari user berdasarkan googleId atau email
    let user = await prisma.user.findFirst({
        where: {
            OR: [
                { googleId: data.id },
                { email: data.email }
            ]
        }
    });

    if (!user) {
        // Buat user baru
        user = await prisma.user.create({
            data: {
                email: data.email,
                name: data.name || data.email.split("@")[0],
                emailVerified: data.verified_email || false,
                googleId: data.sub,
                role: "STUDENT", // default role
            },
        });
    } else {
        // Update googleId kalau belum ada (link account)
        if (!user.googleId) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: data.sub },
            });
        }
    }

    // Generate token SAMA seperti login biasa
    const accessToken = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateToken({ id: user.id }, false);

    // Simpan hashed refresh token di DB (untuk revoke nanti)
    await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken: await bcrypt.hash(refreshToken, 10)
        },
    });

    // Set httpOnly cookie
    // res.cookie("refreshToken", refreshToken, {
    //     httpOnly: true,
    //     secure: config.env === "production",
    //     sameSite: "strict",
    //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    // });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        accessToken,
        refreshToken,
    };
};

const login = async (req, res) => {
    const data = validate(loginUserValidation, req);

    const user = await findUser({
        email: data.email,
        select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
        },
    })

    // const user = await prisma.user.findUnique({
    //     where: {
    //         email: data.email
    //     },
    //     select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //         password: true,
    //         role: true
    //     }
    // });


    if (!user || !(await bcrypt.compare(data.password, user.password))) {
        throw new ResponseError(401, 'Invalid email or password');
    }

    const accessToken = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateToken({ id: user.id }, false);

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: await bcrypt.hash(refreshToken, 10) },
    });

    // Set cookie refresh token
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.env === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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

const register = async (req) => {
    const data = validate(registerUserValidation, req);

    const user = await findUser({
        email: data.email,
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });

    // const user = await prisma.user.findUnique({
    //     where: {
    //         email: data.email
    //     }
    // });

    if (user) {
        throw new ResponseError(400, "email already exists");
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
    const data = validate(getUserValidation, req);

    const user = await findUser({
        id: data,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });

    // const user = await prisma.user.findUnique({
    //     where: {
    //         id: data
    //     },
    //     select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //         role: true,
    //         telp: true,
    //         createdAt: true,
    //         updatedAt: true
    //     }
    // });

    if (!user) {
        throw new ResponseError(404, "user is not found");
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
            telp: true,
            createdAt: true,
            updatedAt: true
        }
    });
}

const update = async (req, userId) => {
    const data = validate(updateUserValidation, req);

    const user = await findUser({
        id: userId,
        select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            updatedAt: true,
        }
    });

    // const user = await prisma.user.findUnique({
    //     where: {
    //         id: userId
    //     }
    // });

    if (!user) {
        throw new ResponseError(404, "user is not found");
    }

    const dataToUpdate = {};

    if (data.name) dataToUpdate.name = data.name;
    if (data.email) dataToUpdate.email = data.email;

    if (data.password) {
        if (!data.currentPassword || !(await bcrypt.compare(data.currentPassword, user.password || ""))) {
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
    // id = validate(getUserValidation, id);
    // const user = await prisma.user.findUnique({
    //     where: {
    //         id: id
    //     }
    // });;
    const user = await findUser({
        id,
        select: {
            id: true
        }
    });

    if (!user) {
        throw new ResponseError(404, "user is not found");
    }

    return prisma.user.delete({
        where: {
            id: id
        }
    });
}

// pake http-only cookie
export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        // Cari user yang punya refreshToken ini (hashed)
        const users = await prisma.user.findMany({
            where: { refreshToken: { not: null } },
        });

        for (const user of users) {
            const isMatch = await bcrypt.compare(refreshToken, user.refreshToken || "");
            if (isMatch) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { refreshToken: null },
                });
                break;
            }
        }
    }

    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict", secure: config.env === "production" });
    return res.json({ message: "Logged out successfully" });
};

const createInstructor = async (req, res) => {
    // authenticate + restrictTo("ADMIN") di route

    const data = validate(createInstructorValidation, req.body); // { name, email }

    const existingUser = await findUser({
        email: data.email,
        select: { email: true }
    });
    // const existingUser = await prisma.user.findUnique({
    //     where: { email: data.email },
    // });

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

    // Kirim email: "Akun instructor kamu sudah dibuat. Login di link ini..."
    // sendEmail(data.email, "Akun Instructor", `Password sementara: ${tempPassword}`);

    return res.json({
        message: "Instructor berhasil dibuat",
        user: { id: user.id, name: user.name, email: user.email },
        // temporaryPassword: tempPassword, // hanya di dev, matikan di prod
    });
};

const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new ResponseError("Refresh token required", 401);

    let payload;
    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        throw new ResponseError("Invalid or expired refresh token", 401);
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
    });

    if (!user || !user.refreshToken) {
        throw new ResponseError("Invalid refresh token", 401);
    }

    // Verify hashed token di DB
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new ResponseError("Invalid refresh token", 401);

    const newAccessToken = generateToken({ id: user.id, role: user.role });
    // Optional: rotate refresh token
    const newRefreshToken = generateToken({ id: user.id }, false);

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: await bcrypt.hash(newRefreshToken, 10) },
    });

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: config.env === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken: newAccessToken });
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
    refreshToken
}