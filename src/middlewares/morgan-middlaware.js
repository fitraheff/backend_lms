import morgan from "morgan";
import { logger } from "../Application/logging.js";

const morganMiddleware = morgan("combined",
    {
        stream: {
            write: (message) => logger.http(message.trim()),
        },
        skip: (req, res) =>
            req.url === "/health" ||
            process.env.NODE_ENV === "test" ||
            req.url.startsWith('/static') ||
            (process.env.NODE_ENV === "production" && res.statusCode < 400),
    }
);

export {
    morganMiddleware
}