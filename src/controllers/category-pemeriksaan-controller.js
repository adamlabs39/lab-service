import successResponse from "../response/success-response.js";
import CategoryPemeriksaanService from "../services/category-pemeriksaan-service.js";

export default class CategoryPemeriksaanController {
    static async create(request, response, next) {
       try {
        const data = request.body;
        data.faskes_uuid = "faskes_uuid";
        const categoryPemeriksaan = await CategoryPemeriksaanService.create(data);
       return response.status(201).json(successResponse("Category Pemeriksaan created", categoryPemeriksaan));
       } catch (error) {
         next(error)
       }
    }

    static async update(request, response, next) {
        try {
            const data = request.body;
            const uuid = request.params.uuid;
            data.faskes_uuid = "faskes_uuid";
            await CategoryPemeriksaanService.update(uuid, data);

            response.status(200).json(successResponse("Category Pemeriksaan updated"));
        } catch (error) {
            next(error)
        }
    }

    static async delete(request, response, next) {
        try {
            const uuid = request.params.uuid;
            await CategoryPemeriksaanService.delete(uuid);
            response.status(200).json(successResponse("Category Pemeriksaan deleted"));
        } catch (error) {
            next(error)
        }
    }

    static async show(request, response, next) {
        try {
            const uuid = request.params.uuid;
            const categoryPemeriksaan = await CategoryPemeriksaanService.show(uuid);
            response.status(200).json(successResponse("Category Pemeriksaan detail", categoryPemeriksaan));
        } catch (error) {
            next(error)
        }
    }

    static async findAll(request, response, next) {
        try {
            request.body.faskes_uuid = "faskes_uuid";
            request.body.name = request.query.name;
            request.body.page = request.query.page; 
            request.body.limit = request.query.limit;


            const categoryPemeriksaan = await CategoryPemeriksaanService.findAll(request.body);
            response.status(200).json(categoryPemeriksaan);
        } catch (error) {
            next(error)
        }
    }
}