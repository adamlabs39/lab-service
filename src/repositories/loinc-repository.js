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

    static async findByNameIn(names) {
        console.log("findByNameIn", names);
        return await LoincModel.findAll({
            where: {
                name: {
                    [Op.in]: names,
                },
                deleted_at: { [Op.is]: null }
            }
        });
    }
}   