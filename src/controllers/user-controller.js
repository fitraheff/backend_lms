import userService from "../services/user-service";
import { setRefreshTokenCookie } from '../utils/cookie.js'

export const googleLogin = async (req, res) => {
    const authUrl = userService.getGoogleLoginUrl();
    res.redirect(authUrl);
}

export const googleCallback = async (req, res, next) => {
    try {
        const { code } = req.query;

        const { accessToken, refreshToken, user } = await userService.googleCallback(code);

        // Set httpOnly cookie untuk refresh token
        setRefreshTokenCookie(res, refreshToken);

        // Redirect ke frontend dengan accessToken di query (untuk SPA)
        // ATAU return JSON kalau API-only
        // const redirectUrl = `${config.frontendUrl}/auth-success?accessToken=${accessToken}&userId=${user.id}`;
        // return res.redirect(redirectUrl);

        // Alternatif lebih aman (rekomendasi untuk production):
        return res.json({
            accessToken,
            user
        });
    } catch (error) {
        next(error);
        // console.error("Google OAuth Error:", error);
        // res.redirect(`${config.frontendUrl}/login?error=google_auth_failed`);
    }
}