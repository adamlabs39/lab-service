import successResponse from "../response/success-response.js";
import OrderLabService from "../services/order-lab-service.js";

export default class OrderLabController{
    static async create(req, res, next){
        try {
            const data = req.body;
            data.faskes_uuid = "faskes_uuid";
            data.petugas_order = "petugas_order";
            await OrderLabService.create(data);
            res.status(201).json(successResponse("Data berhasil disimpan"));
        } catch (error) {
            next(error);
        }
    }

    static async show(req, res, next){
        try {
            const faskesUuid = "faskes_uuid";
            const data = await OrderLabService.findOne(req.params.uuid, faskesUuid);
            res.status(200).json(successResponse("Data berhasil ditampilkan",data));
        } catch (error) {
            next(error);
        }
    }

    static async findAll(req, res, next){
        try {
            const data = req.query;
            data.faskes_uuid = "faskes_uuid";
            const result = await OrderLabService.findAll(data);
            res.status(200).json(successResponse("Data berhasil ditampilkan", result));
        } catch (error) {
            next(error);
        }
    }
}