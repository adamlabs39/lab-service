import validateExcel from "../helpers/validator-excel.js";
import successResponse from "../response/success-response.js";
import TarifLabService from "../services/tarif-lab-service.js";

export default class TarifLabController {
    static async create(req, res, next) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;
            await TarifLabService.create(req.body);
            return res.status(201).json(successResponse("data berhasil disimpan"));
        } catch (error) {
            next(error);
        }
    }  
    
    static async update(req, res, next) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;
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
            req.body.penjamin_uuids = req.query.penjamin_uuids;
            req.body.pelayanans = req.query.pelayanans;
            req.body.faskes_uuid = req.author.faskesUuid;

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

    static async import(req, res, next) {
        try {
            validateExcel(req.file);
            const path = req.file.path;
            const result = await TarifLabService.import(path, req.author.faskesUuid);
            res.status(200).json(successResponse("Data berhasil diimport", result));
        } catch (error) {
            next(error);
        }
    }
}