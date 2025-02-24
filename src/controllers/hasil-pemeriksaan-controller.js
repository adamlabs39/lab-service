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
}