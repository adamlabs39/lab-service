import {
  ItemPemeriksaanModel,
  KelompokPemeriksaanModel,
  OrderLabModel,
  OrderLabPemeriksaanModel,
  TarifLabItemModel,
  TarifLabModel,
} from "@adameds/model-sdk/lab";
import toEpochDate from "../helpers/date-helper.js";
import { status } from "../services/order-lab-service.js";
import { Op } from "sequelize";
import pagination from "../helpers/pagination.js";

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

TarifLabItemModel.belongsTo(TarifLabModel, {
  foreignKey: "tarif_lab_uuid",
  as: "tarif_lab_item",
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

  static async findRekapPemeriksaan(req) {
    const whereDate = {};

    if (req.start_date || req.end_date) {
      whereDate["$order_lab.tgl_order$"] = {};

      if (req.start_date) {
        whereDate["$order_lab.tgl_order$"][Op.gte] = req.start_date;
      }

      if (req.end_date) {
        whereDate["$order_lab.tgl_order$"][Op.lte] = req.end_date;
      }
    }

    let whereSearch = {};

    if (req.search) {
      whereSearch = {
        [Op.or]: [
          {
            "$item_pemeriksaan.name$": {
              [Op.iLike]: `%${req.search}%`,
            },
          },
          {
            "$kelompok_pemeriksaan.name$": {
              [Op.iLike]: `%${req.search}%`,
            },
          },
        ],
      };
    }

    const wherePelayanan = {};

    if (req.pelayanan) {
      wherePelayanan.pelayanan = req.pelayanan;
    }

    const options = {
      where: {
        faskes_uuid: req.faskes_uuid,
        ...whereDate,
        ...whereSearch,
        deleted_at: { [Op.is]: null },
      },
      include: [
        {
          model: TarifLabModel,
          as: "tarif_lab",
          where: {
            deleted_at: { [Op.is]: null },
          },
          attributes: ["code", "name"],
          include: [
            {
              model: TarifLabItemModel,
              as: "tarif_lab_item",
              where: {
                deleted_at: { [Op.is]: null },
              },
              include: [
                {
                  model: KelompokPemeriksaanModel,
                  as: "kelompok_pemeriksaan",
                  required: false, // Penting: biarkan tetap muncul meski relasi kosong
                  where: { deleted_at: { [Op.is]: null } },
                  attributes: ["uuid", "code", "name"],
                },
                {
                  model: ItemPemeriksaanModel,
                  as: "item_pemeriksaan",
                  required: false, // Penting: biarkan tetap muncul meski relasi kosong
                  where: { deleted_at: { [Op.is]: null } },
                  attributes: ["uuid", "code", "name"],
                },
              ],
            },
          ],
        },
        {
          model: OrderLabModel,
          as: "order_lab",
          where: {
            order_status: status.SELESAI,
            deleted_at: { [Op.is]: null },
          },
          attributes: ["created_at"],
        },
      ],
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
    };

    return await pagination(OrderLabPemeriksaanModel, req, options);
  }
}
