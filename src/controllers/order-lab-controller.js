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

    static async update(req, res, next){
        try {
            const data = req.body;
            data.faskes_uuid = "faskes_uuid";
            await OrderLabService.update(req.params.uuid, data);
            res.status(200).json(successResponse("Data berhasil diupdate"));
        } catch (error) {
            next(error);
        }
    }

    static async updateBatalOrder(req, res, next){
        try {
            const data = req.body;
            data.faskes_uuid = "faskes_uuid";
            await OrderLabService.updateBatalOrder(data);
            res.status(200).json(successResponse("Data berhasil diupdate"));
        } catch (error) {
            next(error);
        }
    }

    static async selesaiPeriksa(req,res,next){
        try {
            const faskesUuid = 'faskes_uuid';
            const uuid = req.params.uuid
            await OrderLabService.selesaiPeriksa(uuid, faskesUuid);
            res.status(200).json(successResponse("Data berhasil diupdate"));
        } catch (error) {
            next(error);
        }
    }
}