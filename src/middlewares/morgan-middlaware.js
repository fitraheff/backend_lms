import morgan from "morgan";
import { logger } from "../Application/logging.js";
import { config } from "../utils/config.js";

const morganMiddleware = morgan("combined",
    {
        stream: {
            write: (message) => logger.http(message.trim()),
        },
        skip: (req, res) =>
            req.url === "/health" ||
            config.env === "test" ||
            req.url.startsWith('/static') ||
            (config.env === "production" && res.statusCode < 400),
    }
);

export {
    morganMiddleware
}