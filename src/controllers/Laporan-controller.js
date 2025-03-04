import successResponse from "../response/success-response.js"
import LaporanService from "../services/laporan-service.js"

export default class LaporanController{
    static async getKunjungan(req, res, next){
        try {
            req = req.query
            req.faskes_uuid = "faskes_uuid" 
            const laporan = await LaporanService.getKunjungan(req)
            res.status(200).json(successResponse("Data Berhasil ditampilkam", laporan))
        } catch (error) {
            next(error)
        }
    }
}