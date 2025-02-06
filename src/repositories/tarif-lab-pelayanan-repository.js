import { TarifLabPelayananModel } from "@adameds/model-sdk/lab";
import toEpochDate from "../helpers/date-helper.js";

export default class TarifLabPelayananRepository {
    static async bulkCreate(data, transaction) {
        return await TarifLabPelayananModel.bulkCreate(data, { transaction });
    }

    static async deleteByTarifLab(tarif_lab_uuid, transaction) {
        return await TarifLabPelayananModel.update(
            { deleted_at: toEpochDate(new Date()) },
            { where: { tarif_lab_uuid: tarif_lab_uuid } },
            { transaction }
        );
    }

}