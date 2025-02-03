import successResponse from "../response/success-response.js";
import KelompokPemeriksaanService from "../services/kelompok-pemeriksaan-service.js";

export default class KelompokPemeriksaanController {
    static async create(req, res, next) {
        try {
            const data = req.body;
            data.faskes_uuid = "faskes_uuid";
            console.log("kontroler");
            await KelompokPemeriksaanService.create(data);
            return res.status(201).json(successResponse("Kelompok Pemeriksaan created"));
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const uuid = req.params.uuid;
            const data = req.body;
            data.faskes_uuid = "faskes_uuid";
            await KelompokPemeriksaanService.update(uuid, data);
            return res.status(200).json(successResponse("Kelompok Pemeriksaan updated"));
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const uuid = req.params.uuid;
            await KelompokPemeriksaanService.delete(uuid);
            return res.status(200).json(successResponse("Kelompok Pemeriksaan deleted"));
        } catch (error) {
            next(error);
        }
    }

    static async findAll(req, res, next) {
        try {
            req.body.name = req.query.name;
            req.body.page = req.query.page;
            req.body.limit = req.query.limit;
            req.body.faskes_uuid = "faskes_uuid";
            const result = await KelompokPemeriksaanService.getAll(req.body);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}