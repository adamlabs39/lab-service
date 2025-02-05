import { PenjaminModel } from "@adameds/model-sdk/datamaster";
import { Op } from "sequelize";

export default class PenjaminRepository {
    static async findByUuid(uuid) {
        return await PenjaminModel.findOne({
            where: {
                uuid: uuid,
                deleted_at: { [Op.is]: null },
            },
            attributes: {
                exclude: ["created_at", "updated_at", "deleted_at"],
            },
        });
    }
}