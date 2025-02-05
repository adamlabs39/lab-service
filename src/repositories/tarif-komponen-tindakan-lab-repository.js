import { TarifKomponenTindakanLabModel } from "@adameds/model-sdk/lab";
import { Op } from "sequelize";
import toEpochDate from "../helpers/date-helper.js";

export default class TarifKomponenTindakanLabRepository {
    static async bulkCreate(data) {
        return await TarifKomponenTindakanLabModel.bulkCreate(data);
    }

    static async findByUuid(uuid) {
        return await TarifKomponenTindakanLabModel.findOne({
            where: { 
                uuid: uuid,
                deleted_at: {
                    [Op.is]: null
                }
             },
        });
    }

    static deleteByTarifLab(uuid) {
        return TarifKomponenTindakanLabModel.update(
            { deleted_at: toEpochDate(new Date()) },
            { where: { tarif_lab_uuid: uuid } }
        );
    }
}