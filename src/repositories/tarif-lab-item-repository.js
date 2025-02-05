import { ItemPemeriksaanModel, KelompokPemeriksaanModel, TarifLabItemModel, TarifLabModel } from "@adameds/model-sdk/lab";
import toEpochDate from "../helpers/date-helper.js";


TarifLabItemModel.belongsTo(TarifLabModel, {
    foreignKey: "tarif_lab_uuid",
    as: "tarif_lab",
    constraints: false,
})

TarifLabItemModel.belongsTo(ItemPemeriksaanModel, {
    foreignKey: "item_pemeriksaan_uuid",
    as: "item_pemeriksaan",
    constraints: false,
})

TarifLabItemModel.belongsTo(KelompokPemeriksaanModel, {
    foreignKey: "kelompok_pemeriksaan_uuid",
    as: "kelompok_pemeriksaan",
    constraints: false,
})

export default class TarifLabItemRepository {
    static async bulkCreate(data) {
        return await TarifLabItemModel.bulkCreate(data);
    }

    static async deleteByTarifLab(tarif_lab_uuid) {
        return await TarifLabItemModel.update(
            { deleted_at: toEpochDate(new Date()) },
            { where: { tarif_lab_uuid: tarif_lab_uuid } }
        );
    }
}



