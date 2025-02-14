import { OrderLabPemeriksaanModel } from "@adameds/model-sdk/lab";

export default class OrderLabPemeriksaanRepository {
    static async bulkCreate(data, transaction) {
        return await OrderLabPemeriksaanModel.bulkCreate(data, { transaction });
    }
}