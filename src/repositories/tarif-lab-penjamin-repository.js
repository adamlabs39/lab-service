import { PenjaminModel } from "@adameds/model-sdk/datamaster";
import { TarifLabPenjaminModel } from "@adameds/model-sdk/lab";
import toEpochDate from "../helpers/date-helper.js";

TarifLabPenjaminModel.belongsTo(PenjaminModel, {
    foreignKey: "penjamin_uuid",
    as: "penjamin",
    constraints: false,
})

export default class TarifLabPenjaminRepository {
    static async bulkCreate(data) {
        return await TarifLabPenjaminModel.bulkCreate(data);
    }

    static async findByUuid(uuid) {
        return await TarifLabPenjaminModel.findOne({
            where: { uuid: uuid },
            attributes: {
                exclude: ["created_at", "updated_at", "deleted_at"],
            },
        });
    }

    static async deleteByTarifLab(tarif_lab_uuid) {
        return await TarifLabPenjaminModel.update(
            { deleted_at: toEpochDate(new Date()) },
            { where: { tarif_lab_uuid: tarif_lab_uuid } }
        );
    }
}