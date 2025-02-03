import { LoincModel } from "@adameds/model-sdk/datamaster";
import { Op } from "sequelize";

export default class LoincRepository {
    static async findByUuid(uuid) {
        
        return await LoincModel.findOne({
            where: {
                uuid: uuid,
                deleted_at: { [Op.is]: null },
            }
        });
    }
}   