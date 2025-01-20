// impoxrt { date } from "zod";
import toEpochDate from "../helpers/date-helper.js";
import BpjsModel from "../../../model-sdk/models/admisi/bpjs-model.js";
import { CategoryPemeriksaanModel } from "@adameds/model-sdk/lab";
import { Op } from "sequelize";
import pagination from "../helpers/pagination.js";

export default class CategoryPemeriksaanRepository {
  static async create(data) {
    return await CategoryPemeriksaanModel.create(data);
  }

  static async update(uuid, data) {
    return await CategoryPemeriksaanModel.update(data, {
      where: { uuid: uuid },
    });
  }

  static async delete(uuid) {
    return await CategoryPemeriksaanModel.update(
      { deleted_at: toEpochDate(new Date()) },
      { where: { uuid: uuid } }
    );
  }

  static async findByCode(code) {
    return await CategoryPemeriksaanModel.findOne({
      where: {
        code: code,
        deleted_at: null,
      },
    });
  }

  static async findByUuid(uuid) {
    return await CategoryPemeriksaanModel.findByPk(uuid);
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
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
    };

    return pagination(CategoryPemeriksaanModel, req, options);
  }
}
