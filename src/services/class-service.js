import { prisma } from "../Application/prisma.js";
import { cache } from "../Application/cache.js";
import { ResponseError } from "../utils/response-error.js";
import { validate } from "../validations/validation.js";
import { Validation } from "../validations/module-validation.js";

const defaultModuleSelect = {
    id: true,
    title: true,
    desc: true,
    price: true,
    cover: true
}

const findModule = async (title, select = defaultModuleSelect) => {
    if (!title) {
        throw new ResponseError('title harus ada', 400)
    }

    const module = await prisma.module.findUnique({
        where: { title },
        select,
    })

    return module
}

const checkInstructorAndCategoryMustExist = async (instructorId, categoryId) => {
    const instructor = await prisma.user.findUnique({
        where: { id: instructorId },
        select: { id: true, role: true }
    })

    if (!instructor || instructor.role !== 'INSTRUCTOR') {
        throw new ResponseError('Instructor tidak valid', 403)
    }

    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true }
    })

    if (!category) {
        throw new ResponseError('Category tidak ditemukan', 404)
    }
}
const create = async (req, instructorId, categoryId) => {
    const data = validate(Validation.createModuleValidation, req)

    await checkInstructorAndCategoryMustExist(instructorId, categoryId)

    const module = await findModule({
        title: data.title,
        select: {
            title: true
        }
    })

    if (module) {
        throw new ResponseError("Module alredy exists", 400)
    }

    return await prisma.module.create({
        data: {
            title: data.title,
            desc: data.desc,
            price: data.price,
            cover: data.cover,
            // instructorId,
            categoryId,
            isPublished: false,
            level: 'BEGINNER'
        }
    })
}

const update = async (req, moduleId, instructorId) => {
    const data = validate(Validation.updateModuleValidation, req)

    await checkInstructorAndCategoryMustExist(instructorId, data.categoryId)

    const module = await findModule({
        where: {
            id: moduleId,
            // instructorId,
            // categoryId
        },
        select: {
            id: true,
            // instructorId: true,
            // categoryId: true
        }
    })

    if (!module) {
        throw new ResponseError("Module not found", 404)
    }

    return await prisma.module.update({
        where: {
            id: moduleId
        },
        data: {
            title: data.title,
            desc: data.desc,
            price: data.price,
            cover: data.cover,
            categoryId: data.categoryId,
            isPublished: data.isPublished,
            level: data.level
        },
        select: {
            id: true,
            title: true,
            desc: true,
            price: true,
            cover: true,
            // instructorId: true,
            // categoryId: true
        }
    })
}

const get = async (moduleId) => {
    const module = await findModule({
        where: { id: moduleId },
        select: {
            id: true,
            title: true,
            desc: true,
            price: true,
            cover: true,
            category: {
                select: {
                    id: true,
                    title: true
                }
            },
            instructor: {
                select: {
                    id: true,
                    name: true,
                }
            },
            isPublished: true,
            level: true,
            totalLessons: {
                select: {
                    _count: true
                }
            },
            totalDuration: {
                select: {
                    _sum: {
                        duration: true
                    }
                }
            },
            averageRating: {
                select: {
                    _avg: {
                        rating: true
                    }
                }
            },
            totalStudents: {
                select: {
                    _count: true
                }
            }
        }
    })

    if (!module) {
        throw new ResponseError("Module not found", 404)
    }

    return module
}

const search = async (request) => {
    // Validasi input request sesuai dengan schema searchModuleValidation
    // request = validate(searchModuleValidation, request);

    // Hitung berapa banyak data yang perlu di-skip untuk pagination
    // Contoh: Page 1 skip 0, Page 2 skip 10, Page 3 skip 20 (dengan size 10)
    const skip = (request.page - 1) * request.size;

    // Inisialisasi object where untuk filter query database
    const where = {};

    // Filter berdasarkan title jika dikirim di request (case-insensitive)
    if (request.title) {
        where.title = { contains: request.title, mode: 'insensitive' };
    }

    // Filter berdasarkan category jika dikirim di request (case-insensitive)
    if (request.category) {
        where.category = { contains: request.category, mode: 'insensitive' };
    }

    // Filter berdasarkan status jika dikirim di request (exact match)
    if (request.level) {
        where.level = request.level;
    }

    // Jalankan 2 query database secara paralel menggunakan Promise.all untuk performa lebih baik
    const [modules, totalItems] = await Promise.all([
        // Query 1: Ambil data modules sesuai filter dengan pagination
        prisma.module.findMany({
            where,                              // Terapkan filter yang sudah di-set
            select: {
                defaultModuleSelect,
                category: {
                    id: true,
                    title: true
                },
                instructor: {
                    id: true,
                    name: true
                },
                level: true,
                // averageRating: {
                //     select: {
                //         _avg: {
                //             rating: true
                //         }
                //     }
                // },  
                // totalStudents: {
                //     select: {
                //         _count: true
                //     }
                // }
            },      // Pilih field mana saja yang ditampilkan
            take: request.size,                 // Batasi jumlah data per halaman (misal: 10)
            skip: skip,                         // Lewati data sesuai halaman
            orderBy: { createdAt: 'desc' }     // Urutkan dari yang paling baru
        }),
        // Query 2: Hitung total data yang sesuai dengan filter (untuk menghitung total halaman)
        prisma.module.count({ where })
    ]);

    // Return response dengan data modules dan informasi pagination
    return {
        data: modules,                        // Array berisi module-module yang ditemukan
        paging: {
            page: request.page,                 // Halaman saat ini
            total_item: totalItems,             // Total semua data yang match filter
            total_page: Math.ceil(totalItems / request.size)  // Total halaman (pembulatan ke atas)
        }
    };
};

const remove = async (moduleId, instructorId) => {
    const module = await findModule({
        where: {
            id: moduleId,
            instructorId: instructorId
        }
    })

    if (!module) {
        throw new ResponseError("Module not found", 404)
    }

    return prisma.module.delete({
        where: {
            id: moduleId
        }
    })
}

const myModules = async (instructorId) => {
    // Validasi bahwa instructorId tidak kosong atau null
    if (!instructorId) {
        throw new ResponseError(401, "Authentication required");
    }

    // Ambil semua module milik instructor yang sedang login
    const modules = await prisma.module.findMany({
        where: {
            instructorId: instructorId  // Filter hanya module milik instructor ini
        },
        select: {
            id: true,
            title: true,
            desc: true,
            price: true,
            cover: true,
            isPublished: true,
            level: true,
            category: {
                select: {
                    id: true,
                    title: true
                }
            },
            createdAt: true,
            updatedAt: true
            // totalLessons: {
            //     select: {
            //         _count: true
            //     }
            // },
            // totalStudents: {
            //     select: {
            //         _count: true
            //     }
            // },
            // revenue: {
            //     select: {
            //         _sum: {
            //             price: true
            //         }
            //     }
            // }
        },
        orderBy: {
            createdAt: 'desc'  // Urutkan dari yang paling baru
        }
    });

    // Return data modules
    return modules;
};

export default {
    create,
    update,
    remove,
    myModules,
    get,
    search
}