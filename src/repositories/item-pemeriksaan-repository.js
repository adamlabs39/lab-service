import { CategoryPemeriksaanModel, ItemPemeriksaanModel, PilihanHasilItemPemeriksaanModel } from "@adameds/model-sdk/lab";
import pagination from "../helpers/pagination.js";
import toEpochDate from "../helpers/date-helper.js";
import { Op } from "sequelize";

export default class ItemPemeriksaanRepository {
  static async create(data) {
    console.log("data", data);
    return await ItemPemeriksaanModel.create(data);
  }

  static async update(uuid, data) {
    return await ItemPemeriksaanModel.update(data, {
      where: { uuid: uuid },
    });
  }

  static async findByUuids(uuids) {
    return await ItemPemeriksaanModel.findAll({
      where: {
        uuid: {
          [Op.in]: uuids,
        },
        deleted_at: {
          [Op.is]: null,
        },
      },
    });
  }


  static async delete(uuid) {
    console.log("uuid", uuid);
    return await ItemPemeriksaanModel.update(
      { deleted_at: toEpochDate(new Date()) },
      { where: { uuid: uuid } }
    );
  }

  static async findByCode(code, faskes_uuid) {
    return await ItemPemeriksaanModel.findOne({
      where: {
        code: code,
        deleted_at: {
          [Op.is]: null,
        },
        faskes_uuid: faskes_uuid,
      },
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
    });
  }

  static async findByUuid(uuid) {
    return await ItemPemeriksaanModel.findOne({
      where: {
        uuid: uuid,
        deleted_at: { [Op.is]: null },
      },
      include: [
        {
          model: CategoryPemeriksaanModel,
          as: "category_pemeriksaan",
        attributes:["name", "id", "uuid"],
      },
      {
        model: PilihanHasilItemPemeriksaanModel,
        as: "pilihan_hasil_item_pemeriksaan",
        attributes:["pilihan_hasil"],
      }
      ]});
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
      include: [
        {
          model: CategoryPemeriksaanModel,
          as: "category_pemeriksaan",
          attributes: ["name", "id", "uuid"],
        },
      ],
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
    };

    return pagination(ItemPemeriksaanModel, req, options);
  }
}
