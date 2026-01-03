import generateSwagger from "swagger-autogen";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swagger = swaggerAutogen({ openapi: '3.0.0' }); // Gunakan versi 3.0.0 secara eksplisit

// Lokasi file hasil generate (OUTPUT)
const outputFile = path.join(__dirname, '../../Doc/swagger.json');

// Lokasi file route yang akan dibaca (INPUT)
// Berikan path string, jangan di-import filenya di atas
const endpointsFiles = [path.join(__dirname, '../routes/user-api.js')];

// import swaggerFile from "../../Doc/swagger.json" with {type: 'json'};
// import apiRouteFile from "../routes/user-api.js";

const baseUrl = "http://localhost:8000";

// const options = {
//     openapi: "OpenAPI 3",
//     language: "en-US",
//     disableLogs: false,
//     autoHeaders: false,
//     autoQuery: false,
//     autoBody: false,
// };

const swaggerDocument = {
    info: {
        version: "1.0.0",
        title: "Todo Apis",
        description: "API for Managing todo calls",
        contact: {
            name: "API Support",
            email: "tiwariankit496@gmail.com",
        },
    },
    host: `${baseUrl}`,
    basePath: "/",
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
    tags: [
        {
            name: "TODO CRUD",
            description: "TODO related apis",
        },
        {
            name: "Todo",
            description: "Todo App",
        },
    ],
    securityDefinitions: {},
    definitions: {
        todoResponse: {
            code: 200,
            message: "Success",
        },
        "errorResponse.400": {
            code: 400,
            message:
                "The request was malformed or invalid. Please check the request parameters.",
        },
        "errorResponse.401": {
            code: 401,
            message: "Authentication failed or user lacks proper authorization.",
        },
        "errorResponse.403": {
            code: 403,
            message: "You do not have permission to access this resource.",
        },
        "errorResponse.404": {
            code: "404",
            message: "The requested resource could not be found on the server.",
        },
        "errorResponse.500": {
            code: 500,
            message:
                "An unexpected error occurred on the server. Please try again later.",
        },
    },
};

generateSwagger(swaggerFile, apiRouteFile, swaggerDocument);