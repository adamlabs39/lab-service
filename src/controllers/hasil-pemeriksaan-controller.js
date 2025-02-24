import successResponse from "../response/success-response.js";
import HasilPemeriksaanService from "../services/hasil-pemeriksaan-service.js";

export default class HasilPemeriksaanController {
    static async inputHasilPemeriksaan(req, res, next) {
        try {
            const data = req.body;
            data.faskes_uuid = "faskes_uuid";
            const result = await HasilPemeriksaanService.inputHasilPemeriksaan(data);
            res.status(201).json(successResponse("Data berhasil disimpan"));
        } catch (error) {
            next(error);
        }
    }


    static async expertise(req, res, next) {
        try {
            const data = req.body;
            data.faskes_uuid = "faskes_uuid"
            data.order_lab_uuid = req.params.uuid
            await HasilPemeriksaanService.expertise(data);
            res.status(200).json(successResponse("Data berhasil disimpan"));
        } catch (error) {
            next(error);
        }
    }
}