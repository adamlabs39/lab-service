import { TarifKomponenTindakanLabModel } from "@adameds/model-sdk/lab";
import { NameTarifKomponenModel } from "@adameds/model-sdk/datamaster";
import { Op } from "sequelize";
import toEpochDate from "../helpers/date-helper.js";

TarifKomponenTindakanLabModel.belongsTo(NameTarifKomponenModel, {
  foreignKey: "tarif_komponen_uuid",
  as: "tarif_komponen",
  constraints: false,
});
export default class TarifKomponenTindakanLabRepository {
  static async bulkCreate(data, transaction) {
    return await TarifKomponenTindakanLabModel.bulkCreate(data, {
      transaction,
    });
  }

  static async findByUuid(uuid) {
    return await TarifKomponenTindakanLabModel.findOne({
      where: {
        uuid: uuid,
        deleted_at: {
          [Op.is]: null,
        },
      },
    });
  }

  static deleteByTarifLab(uuid, transaction) {
    return TarifKomponenTindakanLabModel.update(
      { deleted_at: toEpochDate(new Date()) },
      { where: { tarif_lab_uuid: uuid } },
      { transaction }
    );
  }
}
