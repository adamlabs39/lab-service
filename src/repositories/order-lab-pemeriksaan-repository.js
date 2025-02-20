import { TarifLabModel } from "@adameds/model-sdk/datamaster";
import {
  OrderLabModel,
  OrderLabPemeriksaanModel,
} from "@adameds/model-sdk/lab";
import toEpochDate from "../helpers/date-helper.js";

OrderLabPemeriksaanModel.belongsTo(OrderLabModel, {
  foreignKey: "order_lab_uuid",
  as: "order_lab",
  constraints: false,
});

OrderLabPemeriksaanModel.belongsTo(TarifLabModel, {
  foreignKey: "tarif_lab_uuid",
  as: "tarif_lab",
  constraints: false,
});

export default class OrderLabPemeriksaanRepository {
  static async bulkCreate(data, transaction) {
    return await OrderLabPemeriksaanModel.bulkCreate(data, { transaction });
  }

  static async deleteByOrderLab(order_lab_uuid, faskes_uuid, transaction) {
    return await OrderLabPemeriksaanModel.update(
      { deleted_at: toEpochDate(new Date()) },
      { where: { order_lab_uuid: order_lab_uuid, faskes_uuid: faskes_uuid } },
      { transaction }
    );
  }
}
