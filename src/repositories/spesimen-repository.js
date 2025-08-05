import { SpesimenModel } from "@adameds/model-sdk/lab";
import toEpochDate from "../helpers/date-helper.js";
import pagination from "../helpers/pagination.js";
import { Op } from "sequelize";

export default class SpesimenRepository {
  static async create(data) {
    return await SpesimenModel.create({
      name: data.name,
      code: data.code,
      faskes_uuid: data.faskes_uuid,
      status: data.status,
    });
  }

  static async update(uuid, data) {
    return await SpesimenModel.update(data, {
      where: { uuid: uuid },
    });
  }

  static async delete(uuid) {
    return await SpesimenModel.update(
      { deleted_at: toEpochDate(new Date()) },
      { where: { uuid: uuid } }
    );
  }

  static async findByCode(code, faskes_uuid) {
    return await SpesimenModel.findOne({
      where: {
        code: code,
        deleted_at: {
          [Op.is]: null,
        },
        faskes_uuid: faskes_uuid,
      },
    });
  }

  static async findByCodeWithoutItself(uuid, req) {
    return await SpesimenModel.findOne({
      where: {
        code: req.code,
        faskes_uuid: req.faskes_uuid,
        deleted_at: {
          [Op.is]: null,
        },
        uuid: { [Op.not]: uuid }, // Kecuali record ini
      },
    });
  }

  static async findByUuid(uuid) {
    return await SpesimenModel.findOne({
      where: { uuid: uuid, deleted_at: { [Op.is]: null } },
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
    });
  }

  static async findAll(req) {
    const options = {
      where: {
        faskes_uuid: req.faskes_uuid,
        name: {
          [Op.iLike]: `%${req.name || ""}%`,
        },
        deleted_at: {
          [Op.is]: null,
        },
      },
      order: [["created_at", "DESC"]],
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
      distinct: true, // Pindahkan ke sini untuk kontrol lebih baik
      subQuery: false,
    };

    return pagination(SpesimenModel, req, options);
  }

  static async findAllActive(req) {
    const options = {
      where: {
        faskes_uuid: req.faskes_uuid,
        name: {
          [Op.iLike]: `%${req.name || ""}%`,
        },
        deleted_at: {
          [Op.is]: null,
        },
        status: {
          [Op.is]: true,
        },
      },
      order: [["created_at", "DESC"]],
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
      distinct: true, // Pindahkan ke sini untuk kontrol lebih baik
      subQuery: false,
    };

    return await SpesimenModel.findAll(options);
  }

  static async findByUuids(uuids) {
    return await SpesimenModel.findAll({
      where: {
        uuid: {
          [Op.in]: uuids,
        },
      },
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
    });
  }

  static async bulkCreate(data, transaction) {
    return await SpesimenModel.bulkCreate(data, { transaction });
  }
}
