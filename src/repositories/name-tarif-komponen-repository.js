import { NameTarifKomponenModel } from "@adameds/model-sdk/datamaster";
import { Op } from "sequelize";

export default class NameTarifKomponenRepository {
    static async findByUuid(uuid) {
        return await NameTarifKomponenModel.findOne({
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