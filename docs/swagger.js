import swaggerAutogen from 'swagger-autogen';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swagger = swaggerAutogen({ openapi: '3.0.0' }); // Gunakan versi 3.0.0 secara eksplisit

// Lokasi file hasil generate (OUTPUT)
const outputFile = path.join(__dirname, '../../Doc/swagger.json');

// Lokasi file route yang akan dibaca (INPUT)
// Berikan path string, jangan di-import filenya di atas
// const endpointsFiles = [
//     path.join(__dirname, '../routes/user-api.js'),
//     path.join(__dirname, '../routes/materi-api.js') // Tambahkan file route materi di sini
// ];

const endpointsFiles = [path.join(__dirname, '../Application/app.js')];

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
    // Untuk OpenAPI 3, gunakan 'servers' bukan 'host'
    servers: [
        {
            url: baseUrl,
            description: "Local server"
        }
    ],
    tags: [
        { name: "TODO CRUD", description: "TODO related apis" },
        { name: "Todo", description: "Todo App" },
    ],
    components: {
        schemas: {
            todoResponse: {
                type: "object",
                properties: {
                    code: { type: "number", example: 200 },
                    message: { type: "string", example: "Success" }
                }
            },
            // Error responses lebih baik dikelompokkan di sini
            errorResponse400: {
                type: "object",
                properties: {
                    code: { type: "number", example: 400 },
                    message: { type: "string", example: "The request was malformed..." }
                }
            }
        }
    }
};

/* Jalankan fungsi generate. 
  PENTING: Argumen pertama adalah PATH file output, bukan objek import.
*/
swagger(outputFile, endpointsFiles, swaggerDocument).then(() => {
    console.log("Swagger file generated successfully!");
});