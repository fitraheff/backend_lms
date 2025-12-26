import { ResponseError } from "../utils/response-error.js";

const validate = (schema, data) => {
    const resutl = schema.validate(data, {
        abortEarly: false,
        allowUnknown: true,
        // stripUnknown: true,
    })
    if (resutl.error) {
        throw new ResponseError(resutl.error.message, 400);
    } else {
        return resutl.value
    }
}

export {
    validate
}