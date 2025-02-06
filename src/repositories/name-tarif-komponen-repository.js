import { NameTarifKomponenModel } from "@adameds/model-sdk/datamaster";
import { Op } from "sequelize";

export default class NameTarifKomponenRepository {
    static async findByUuids(uuids) {
        return await NameTarifKomponenModel.findAll({
            where: {
                uuid: {
                    [Op.in]: uuids,
                },
                deleted_at: {
                    [Op.is]: null,
                },
            },
        });
    }
}