import { config } from "./config.js";

export const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.env === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export const clearRefreshTokenCookie = (res) => {
    res.clearCookie("refreshToken");
};