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
}