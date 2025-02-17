import { TarifLabModel } from "@adameds/model-sdk/datamaster";
import { OrderLabModel, OrderLabPemeriksaanModel } from "@adameds/model-sdk/lab";

OrderLabPemeriksaanModel.belongsTo(OrderLabModel, {
    foreignKey: "order_lab_uuid",
    as: "order_lab",
    constraints: false,
})

OrderLabPemeriksaanModel.belongsTo(TarifLabModel, {
    foreignKey: "tarif_lab_uuid",
    as: "tarif_lab",
    constraints: false,
})

export default class OrderLabPemeriksaanRepository {
    static async bulkCreate(data, transaction) {
        return await OrderLabPemeriksaanModel.bulkCreate(data, { transaction });
    }
}