import { SnomedModel } from "@adameds/model-sdk/datamaster";
import { Op } from "sequelize";

export default class SnomedRepository {
    static async find(uuid) {
        return await SnomedModel.findOne({
            where: {
                uuid: uuid,
                deleted_at: { [Op.is]: null }
            }
        });
    }
}