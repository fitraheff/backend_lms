import userService from "../services/user-service.js";

const googleLogin = async (req, res) => {
    const authUrl = userService.getGoogleLoginUrl();
    res.redirect(authUrl);
}

const googleCallback = async (req, res, next) => {
    try {
        const { code } = req.query;

        const result = await userService.googleCallback(code, res);

        // Set httpOnly cookie untuk refresh token
        // setRefreshTokenCookie(res, refreshToken);

        // Redirect ke frontend dengan accessToken di query (untuk SPA)
        // ATAU return JSON kalau API-only
        // const redirectUrl = `${config.frontendUrl}/auth-success?accessToken=${accessToken}&userId=${user.id}`;
        // return res.redirect(redirectUrl);

        // Alternatif lebih aman (rekomendasi untuk production):
        return res.json({
            message: "Google OAuth successful",
            data: result
        });
    } catch (error) {
        next(error);
        // console.error("Google OAuth Error:", error);
        // res.redirect(`${config.frontendUrl}/login?error=google_auth_failed`);
    }
}

export const login = async (req, res, next) => {
    try {
        const data = req.body;
        const result = await userService.login(data, res)
        res.status(200).json(
            {
                message: "Login successful",
                data: result
            }
        );
    } catch (e) {
        next(e);
    }
}

export const register = async (req, res, next) => {
    try {
        const result = await userService.register(req.body);
        res.status(200).json(
            {
                message: "Register successful",
                data: result
            }
        );
    } catch (e) {
        next(e);
    }
}

const getById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const result = await userService.getById(userId);
        res.status(200).json(
            {
                message: "Get user by id successful",
                data: result
            }
        );
    } catch (e) {
        next(e);
    }
}

const getAll = async (req, res, next) => {
    try {
        const result = await userService.getAll();
        res.status(200).json(
            {
                message: "Get all users successful",
                data: result
            }
        );
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const data = req.body;
        const result = await userService.update(userId, data);
        res.status(200).json(
            {
                message: "Update user successful",
                data: result
            }
        );
    } catch (e) {
        next(e);
    }
}

const remove = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const result = await userService.remove(userId);
        res.status(200).json(
            {
                message: "Delete user successful",
                data: result
            }
        );
    } catch (e) {
        next(e);
    }
}

const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        await userService.logout(refreshToken, res);
        res.status(200).json(
            {
                message: "Logout successful"
            }
        );
    } catch (e) {
        next(e);
    }   
}

const createInstructor = async (req, res, next) => {
    try {
        const result = await userService.createInstructor(req.body);
        res.status(200).json(
            {
                message: "Create instructor successful",
                data: result
            }
        );
    } catch (e) {
        next(e);
    }
}

const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const result = await userService.refreshToken(refreshToken, res);
        res.status(200).json(
            {
                message: "Refresh token successful",
                data: result
            }
        );
    } catch (e) {
        next(e);
    }
}

const setPassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = req.body;
        const result = await userService.setPassword(data, userId);
        res.status(200).json(
            {
                message: "Set password successful",
                data: result
            }
        );
    } catch (e) {
        next(e);
    }
}

export default {
    googleLogin,
    googleCallback,
    login,
    register,
    getById,
    getAll,
    update,
    remove,
    logout,
    createInstructor,
    refreshToken,
    setPassword
}