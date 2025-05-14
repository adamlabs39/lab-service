import {
  ItemKelompokPemeriksaanModel,
  ItemPemeriksaanModel,
  KelompokPemeriksaanModel,
  TarifLabItemModel,
  TarifLabModel,
  TarifLabPelayananModel,
  TarifLabPenjaminModel,
} from "@adameds/model-sdk/lab";
import { Op } from "sequelize";
import toEpochDate from "../helpers/date-helper.js";
import { PenjaminModel } from "@adameds/model-sdk/datamaster";
import pagination from "../helpers/pagination.js";

TarifLabModel.hasMany(TarifLabPenjaminModel, {
  foreignKey: "tarif_lab_uuid",
  as: "tarif_lab_penjamin",
  constraints: false,
});

TarifLabModel.hasMany(TarifLabPelayananModel, {
  foreignKey: "tarif_lab_uuid",
  as: "pelayanan",
  constraints: false,
});

TarifLabModel.hasMany(TarifLabItemModel, {
  foreignKey: "tarif_lab_uuid",
  as: "tarif_lab_item",
  constraints: false,
});

export default class TarifLabRepository {
  static async create(data, transaction) {
    return await TarifLabModel.create(data, { transaction });
  }

  static async bulkCreate(data, transaction) {
    console.log("data", data);
    return await TarifLabModel.bulkCreate(data, { transaction });
  }

  static async findByCode(code, faskes_uuid) {
    return await TarifLabModel.findOne({
      where: {
        code: code,
        deleted_at: null,
        faskes_uuid: faskes_uuid,
      },
    });
  }

  static async findByUuid(uuid) {
    return await TarifLabModel.findOne({
      where: {
        uuid: uuid,
        deleted_at: {
          [Op.is]: null,
        },
      },
      include: [
        {
          model: TarifLabPenjaminModel,
          as: "tarif_lab_penjamin",
          where: {
            deleted_at: {
              [Op.is]: null,
            },
          },

          include: {
            model: PenjaminModel,
            as: "penjamin",
            where: {
              deleted_at: {
                [Op.is]: null,
              },
            },
            attributes: ["uuid", "name"],
          },
        },
        {
          model: TarifLabPelayananModel,
          as: "pelayanan",
          where: {
            deleted_at: {
              [Op.is]: null,
            },
          },
          attributes: ["uuid", "pelayanan"],
        },
        {
          model: TarifLabItemModel,
          as: "tarif_lab_item",
          include: [
            {
              model: KelompokPemeriksaanModel,
              as: "kelompok_pemeriksaan",
              attributes: ["uuid", "name"],
            },
            {
              model: ItemPemeriksaanModel,
              as: "item_pemeriksaan",
              attributes: ["uuid", "name"],
            },
          ],
        },
      ],
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
    });
  }

  static async findByUuids(uuids) {
    console.log("=====");
    console.log(uuids);
    return await TarifLabModel.findAll({
      where: {
        uuid: {
          [Op.in]: uuids,
        },
        deleted_at: {
          [Op.is]: null,
        },
      },
      include: [
        {
          model: TarifLabPenjaminModel,
          as: "tarif_lab_penjamin",
          where: {
            deleted_at: {
              [Op.is]: null,
            },
          },
          include: {
            model: PenjaminModel,
            as: "penjamin",
            where: {
              deleted_at: {
                [Op.is]: null,
              },
            },
            attributes: ["uuid", "name"],
          },
        },
        {
          model: TarifLabPelayananModel,
          as: "pelayanan",
          where: {
            deleted_at: {
              [Op.is]: null,
            },
          },
          attributes: ["uuid", "pelayanan"],
        },
        {
          model: TarifLabItemModel,
          as: "tarif_lab_item",
          required: false,
          include: [
            {
              model: KelompokPemeriksaanModel,
              as: "kelompok_pemeriksaan",
              attributes: ["uuid", "name"],
              include: [
                {
                  model: ItemKelompokPemeriksaanModel,
                  as: "item_kelompok_pemeriksaan",
                  where: {
                    deleted_at: {
                      [Op.is]: null,
                    },
                  },
                  separate: true,
                  include: [
                    {
                      model: ItemPemeriksaanModel,
                      as: "item_pemeriksaan",
                      where: {
                        deleted_at: {
                          [Op.is]: null,
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              model: ItemPemeriksaanModel,
              as: "item_pemeriksaan",
              attributes: ["uuid", "name"],
            },
          ],
        },
      ],
    });
  }

  static async update(uuid, data, transaction) {
    return await TarifLabModel.update(
      data,
      {
        where: {
          uuid: uuid,
        },
      },
      { transaction }
    );
  }

  static async delete(uuid, transaction) {
    return await TarifLabModel.update(
      {
        deleted_at: toEpochDate(new Date()),
      },
      {
        where: {
          uuid: uuid,
        },
      },
      { transaction }
    );
  }

  static async findAll(req) {
    const buildWhereCondition = (uuids) => {
      const condition = {
        deleted_at: { [Op.is]: null },
      };

      if (uuids && uuids.length > 0) {
        condition.uuid = { [Op.in]: uuids };
      }

      return condition;
    };

    const wherePenjamInCondition = buildWhereCondition(req.penjamin_uuids);
    // const wherePelayananInCondition = buildWhereCondition(req.pelayanans);

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
          model: TarifLabPenjaminModel,
          as: "tarif_lab_penjamin",
          required: false,
          where: wherePenjamInCondition,
          include: {
            model: PenjaminModel,
            as: "penjamin",
            required: false,
            where: {
              deleted_at: { [Op.is]: null },
            },
            attributes: ["uuid", "name"],
          },
        },
        {
          model: TarifLabPelayananModel,
          as: "pelayanan",
          required: false,
          ...(req.pelayanans?.length > 0 && {
            where: {
              uuid: { [Op.in]: req.pelayanans },
              deleted_at: { [Op.is]: null },
            },
          }),
          ...(!(req.pelayanans?.length > 0) && {
            where: {
              deleted_at: { [Op.is]: null },
            },
          }),
          attributes: ["uuid", "pelayanan"],
        },
        {
          model: TarifLabItemModel,
          as: "tarif_lab_item",
          required: false,
          where: { deleted_at: { [Op.is]: null } },
          include: [
            {
              model: KelompokPemeriksaanModel,
              as: "kelompok_pemeriksaan",
              required: false,
              where: { deleted_at: { [Op.is]: null } },
              attributes: ["uuid", "name"],
            },
            {
              model: ItemPemeriksaanModel,
              as: "item_pemeriksaan",
              required: false,
              where: { deleted_at: { [Op.is]: null } },
              attributes: ["uuid", "name"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      attributes: { exclude: ["created_at", "updated_at", "deleted_at"] },
      distinct: true, // Pindahkan ke sini untuk kontrol lebih baik
      subQuery: false,
    };

    return await pagination(TarifLabModel, req, options);
  }

  static async findByCodeIn(code, faskes_uuid) {
    return await TarifLabModel.findAll({
      where: {
        code: {
          [Op.in]: code,
        },
        faskes_uuid,
        deleted_at: {
          [Op.is]: null,
        },
      },
    });
  }
}
