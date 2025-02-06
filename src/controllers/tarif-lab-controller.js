import successResponse from "../response/success-response.js";
import TarifLabService from "../services/tarif-lab-service.js";

export default class TarifLabController {
    static async create(req, res, next) {
        try {
            req.body.faskes_uuid = "faskes_uuid";
            await TarifLabService.create(req.body);
            return res.status(201).json(successResponse("data berhasil disimpan"));
        } catch (error) {
            next(error);
        }
    }  
    
    static async update(req, res, next) {
        try {
            req.body.faskes_uuid = "faskes_uuid";
            const uuid = req.params.uuid;
            await TarifLabService.update(uuid, req.body);
            res.status(200).json(successResponse("data berhasil diedit"));
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const uuid = req.params.uuid;
            await TarifLabService.delete(uuid);
            res.status(200).json(successResponse("data berhasil dihapus"));
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            req.body.name = req.query.name;
            req.body.page = req.query.page;
            req.body.limit = req.query.limit;
            req.body.faskes_uuid = "faskes_uuid";

            const tarifLabs = await TarifLabService.findAll(req.body);
            res.status(200).json(successResponse("Data berhasil ditampilkan", tarifLabs));
        } catch (error) {
            next(error);
        }
    }

    static async show(req, res, next) {
        try {
            const uuid = req.params.uuid;
            const tarifLab = await TarifLabService.show(uuid);
            res.status(200).json(successResponse("Data berhasil ditampilkan", tarifLab));
        } catch (error) {
            next(error);
        }
    }
}