import OrderLabRepository from "../repositories/order-lab-repository.js";
import Laporanvalidation from "../validations/laporan-validation.js";
import ZodValidator from "../validations/zod-validator.js";

export default class LaporanService{
    static async getKunjungan(req){
        console.log(req)
        const validdata = ZodValidator.validate(Laporanvalidation.GET_KUNJUNGAN, req)

        const laporan = await OrderLabRepository.findAllSelesai(validdata)
      
        const laporanWithGrandTotalLab = laporan.data.map((item) => {
            const grandTotalLab = item.order_lab_pemeriksaan.reduce((acc, curr) => acc + curr.tarif_lab.grand_total, 0)
            return {
                ...item,
               grand_total_lab : grandTotalLab
            }
        })

        return laporanWithGrandTotalLab
    }
}