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

    static async findByCodeIn(code, faskes_uuid) {
        return await NameTarifKomponenModel.findAll({
            where: {
                code: {
                    [Op.in]: code,
                },
                faskes_uuid,
                deleted_at: {
                    [Op.is]: null,
                },
            },
        });
    }
}