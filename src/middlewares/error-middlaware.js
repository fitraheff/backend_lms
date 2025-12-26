import { ResponseError } from '../utils/response-error.js';

const errorMiddleware = (err, req, res, next) => {
    if (!err) {
        next();
        return;
    }
    if (err instanceof ResponseError) {
        res.status(err.statusCode).json({
            error: err.message
        }).end();
    } else {
        res.status(500).json({
            error: err.message
        })
    }
}

export {
    errorMiddleware
}