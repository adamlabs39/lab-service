import successResponse from "../response/success-response.js";
import ItemPemeriksaanService from "../services/item-pemeriksaan-service.js";

export default class ItemPemeriksaanController {
    static async create(req, res, next) {
        try {
            req.body.faskes_uuid = "faskes_uuid";
            await ItemPemeriksaanService.create(req.body);
            return res.status(201).json(successResponse("Item Pemeriksaan created"));
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            req.body.faskes_uuid = "faskes_uuid";
            const uuid = req.params.uuid;
            await ItemPemeriksaanService.update(uuid, { nama, harga });

            res.status(200).json(successResponse("Item Pemeriksaan updated"));
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const uuid = req.params.uuid;
            await ItemPemeriksaanService.delete(uuid);
            res.status(200).json(successResponse("Item Pemeriksaan deleted"));
        } catch (error) {
            next(error);
        }
    }

    static async show(req, res, next) {
        try {
            const uuid = req.params.uuid;
            const itemPemeriksaan = await ItemPemeriksaanService.findByUuid(uuid);
            res.status(200).json(successResponse("Item Pemeriksaan detail", itemPemeriksaan));
        } catch (error) {
            next(error);
        }
    }


    static async findAll(req, res, next) {
        try {
            req.body.faskes_uuid = "faskes_uuid";
            const itemPemeriksaan = await ItemPemeriksaanService.findAll(req);
            res.status(200).json(successResponse("Item Pemeriksaan list", itemPemeriksaan));
        } catch (error) {
            next(error);
        }
    }
}
