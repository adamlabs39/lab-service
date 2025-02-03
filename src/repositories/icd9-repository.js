import { Icd9Model } from "@adameds/model-sdk/datamaster";
import { Op } from "sequelize"; 

export default class Icd9Repository {
    static async find(uuid) {
        return await Icd9Model.findOne({
            where: {
                uuid: uuid,
                deleted_at: { [Op.is]: null }
            }
        });
    }
}