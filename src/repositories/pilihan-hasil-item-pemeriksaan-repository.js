import { PilihanHasilItemPemeriksaanModel } from "@adameds/model-sdk/lab";
import toEpochDate from "../helpers/date-helper.js";

export default class PilihanHasilItemPemeriksaanRepository {
    static async create(data, transaction) {
        return await PilihanHasilItemPemeriksaanModel.create(data, { transaction });
    }

    static async deleteByItemPemeriksaan(uuid, transaction) {
        return await PilihanHasilItemPemeriksaanModel.update(
            { deleted_at: toEpochDate(new Date()) },
            {where: {
                item_pemeriksaan_uuid: uuid
            }},
            { transaction }
    );
    }
}