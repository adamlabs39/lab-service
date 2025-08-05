import {
  CategoryPemeriksaanModel,
  ItemPemeriksaanModel,
  PilihanHasilItemPemeriksaanModel,
} from "@adameds/model-sdk/lab";
import pagination from "../helpers/pagination.js";
import toEpochDate from "../helpers/date-helper.js";
import { Op, where } from "sequelize";

export default class ItemPemeriksaanRepository {
  static async create(data, transaction) {
    return await ItemPemeriksaanModel.create(data, { transaction });
  }

  static async update(uuid, data, transaction) {
    return await ItemPemeriksaanModel.update(
      data,
      {
        where: { uuid: uuid },
      },
      { transaction }
    );
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

  static async delete(uuid, transaction) {
    console.log("uuid", uuid);
    const res = await ItemPemeriksaanModel.update(
      { deleted_at: toEpochDate(new Date()) },
      { where: { uuid: uuid } },
      { transaction }
    );
  }

  static async findByCode(code, faskes_uuid) {
    console.log("code", code);
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

  static async findByCodeWithoutItself(uuid, req) {
    return await ItemPemeriksaanModel.findOne({
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
    return await ItemPemeriksaanModel.findOne({
      where: {
        uuid: uuid,
        deleted_at: { [Op.is]: null },
      },
      include: [
        {
          model: CategoryPemeriksaanModel,
          as: "category_pemeriksaan",
          attributes: ["name", "id", "uuid"],
        },
        {
          model: PilihanHasilItemPemeriksaanModel,
          as: "pilihan_hasil_item_pemeriksaan",
          attributes: ["pilihan_hasil"],
        },
      ],
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
      include: [
        {
          model: CategoryPemeriksaanModel,
          as: "category_pemeriksaan",
          attributes: ["name", "id", "uuid"],
        },
        {
          model: PilihanHasilItemPemeriksaanModel,
          as: "pilihan_hasil_item_pemeriksaan",
          attributes: ["pilihan_hasil"],
          required: false,
          where: {
            deleted_at: {
              [Op.is]: null,
            },
          },
        },
      ],
      order: [["created_at", "DESC"]],
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
    };

    return pagination(ItemPemeriksaanModel, req, options);
  }

  static async bulckCreate(data, transaction) {
    return await ItemPemeriksaanModel.bulkCreate(data, { transaction });
  }

  static async findByCodeIn(codes, faskes_uuid) {
    console.log("code", codes);
    return await ItemPemeriksaanModel.findAll({
      where: {
        faskes_uuid: faskes_uuid,
        code: {
          [Op.in]: codes,
        },
        deleted_at: { [Op.is]: null },
      },
    });
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
      include: [
        {
          model: CategoryPemeriksaanModel,
          as: "category_pemeriksaan",
          attributes: ["name", "id", "uuid"],
        },
      ],
      order: [["created_at", "DESC"]],
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
    };

    return await ItemPemeriksaanModel.findAll(options);
  }

  static async findByNoUrutWithUuid(req) {
    return await ItemPemeriksaanModel.findOne({
      where: {
        category_pemeriksaan_uuid: req.category_pemeriksaan_uuid,
        no_urut: req.no_urut,
        faskes_uuid: req.faskes_uuid,
        deleted_at: { [Op.is]: null },
        uuid: { [Op.not]: req.uuid }, // Kecuali record ini
      },
    });
  }

  static async findByNoUrut(req) {
    return await ItemPemeriksaanModel.findOne({
      where: {
        category_pemeriksaan_uuid: req.category_pemeriksaan_uuid,
        no_urut: req.no_urut,
        faskes_uuid: req.faskes_uuid,
        deleted_at: { [Op.is]: null },
      },
    });
  }

  static async findAllNoUrut(req) {
    return await ItemPemeriksaanModel.findOne({
      where: {
        category_pemeriksaan_uuid: req.category_pemeriksaan_uuid,
        no_urut: req.no_urut,
        faskes_uuid: req.faskes_uuid,
        deleted_at: { [Op.is]: null },
      },
    });
  }

  static async findByCategoryAndNoUruts({
    category_pemeriksaan_uuid,
    no_uruts,
  }) {
    return await ItemPemeriksaanModel.findAll({
      where: {
        category_pemeriksaan_uuid: category_pemeriksaan_uuid,
        no_urut: { [Op.in]: no_uruts },
      },
      attributes: ["no_urut"], // ambil no_urut saja
      raw: true,
    });
  }
}
