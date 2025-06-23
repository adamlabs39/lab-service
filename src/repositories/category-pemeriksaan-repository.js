import toEpochDate from "../helpers/date-helper.js";
import { CategoryPemeriksaanModel } from "@adameds/model-sdk/lab";
import { Op } from "sequelize";
import pagination from "../helpers/pagination.js";

export default class CategoryPemeriksaanRepository {
  static async create(data, transaction) {
    return await CategoryPemeriksaanModel.create(data, { transaction });
  }

  static async update(uuid, data, transaction) {
    return await CategoryPemeriksaanModel.update(
      data,
      {
        where: { uuid: uuid },
      },
      { transaction }
    );
  }

  static async delete(uuid, transaction) {
    return await CategoryPemeriksaanModel.update(
      { deleted_at: toEpochDate(new Date()) },
      { where: { uuid: uuid } },
      { transaction }
    );
  }

  static async findByCode(code, faskes_uuid) {
    return await CategoryPemeriksaanModel.findOne({
      where: {
        code: code,
        deleted_at: null,
        faskes_uuid: faskes_uuid,
      },
    });
  }

  static async findByUuid(uuid) {
    return await CategoryPemeriksaanModel.findOne({
      where: { uuid: uuid, deleted_at: null },
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
    };

    return pagination(CategoryPemeriksaanModel, req, options);
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
    };

    return await CategoryPemeriksaanModel.findAll(options);
  }

  static async bulkCreate(data, transaction) {
    return await CategoryPemeriksaanModel.bulkCreate(data, { transaction });
  }

  static async findByCodeIn(codes, faskes_uuid) {
    return await CategoryPemeriksaanModel.findAll({
      where: {
        faskes_uuid: faskes_uuid,
        code: {
          [Op.in]: codes,
        },
        deleted_at: { [Op.is]: null },
      },
    });
  }
}
