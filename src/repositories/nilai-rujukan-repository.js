import { NilaiRujukanModel } from "@adameds/model-sdk/lab";
import toEpochDate from "../helpers/date-helper.js";
import { Op } from "sequelize";

export default class NilaiRujukanRepository {
  static async create(data, transaction) {
    return await NilaiRujukanModel.create(data, { transaction });
  }

  static async bulkCreate(data, transaction) {
    return await NilaiRujukanModel.bulkCreate(data, { transaction });
  }

  static async findByUuid(uuid) {
    return await NilaiRujukanModel.findOne({
      where: { uuid: uuid, deleted_at: { [Op.is]: null } },
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
    });
  }

  static async findByItemPemeriksaan(item_pemeriksaan_uuid) {
    return await NilaiRujukanModel.findAll({
      where: {
        item_pemeriksaan_uuid: item_pemeriksaan_uuid,
        deleted_at: {
          [Op.is]: null,
        },
      },
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
    });
  }

  static async findByItemPemeriksaans(item_pemeriksaan_uuids, faskes_uuid) {
    return await NilaiRujukanModel.findAll({
      where: {
        item_pemeriksaan_uuid: {
          [Op.in]: item_pemeriksaan_uuids,
        },
        faskes_uuid: faskes_uuid,
        deleted_at: {
          [Op.is]: null,
        },
      },
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
      raw: true,
      nest: true,
    });
  }

  static async update(uuid, data, transaction) {
    return await NilaiRujukanModel.update(
      data,
      {
        where: { uuid: uuid },
      },
      { transaction }
    );
  }

  static async delete(uuid, transaction) {
    return await NilaiRujukanModel.update(
      { deleted_at: toEpochDate(new Date()) },
      { where: { uuid: uuid } },
      { transaction }
    );
  }
}
