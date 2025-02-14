import { LokasiModel } from "@adameds/model-sdk/datamaster";
import { Op } from "sequelize";

export default class LokasiRepository{
    static async findByUuid(uuid, faskes_uuid){
        return await LokasiModel.findOne({
            where: {
                uuid,
                faskes_uuid,
                deleted_at: {
                    [Op.is]: null
                }
            }
        })
    }
}