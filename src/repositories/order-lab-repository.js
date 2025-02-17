import {
    ItemKelompokPemeriksaanModel,
    ItemPemeriksaanModel,
    KelompokPemeriksaanModel,
  OrderLabModel,
  OrderLabPemeriksaanModel,
  TarifLabItemModel,
  TarifLabModel,
  TarifLabPelayananModel,
  TarifLabPenjaminModel,
} from "@adameds/model-sdk/lab";
import OrderlabModel from "../../../model-sdk/models/lab/order-lab-model.js";
import { Op } from "sequelize";
import { LokasiModel, PenjaminModel, PractitionerModel } from "@adameds/model-sdk/datamaster";

OrderLabModel.belongsTo(LokasiModel, {
  foreignKey: "lokasi_uuid",
  as: "lokasi",
  constraints: false,
});

OrderLabModel.belongsTo(PractitionerModel, {
  foreignKey: "dokter_pengirim_uuid",
  as: "dokterPengirim",
  constraints: false,
});

// OrderLabModel.belongsTo(PractitionerModel, {
//   foreignKey: "petugas_order",
//   as: "petugas_order",
//   constraints: false,
// });

OrderLabModel.hasMany(OrderLabPemeriksaanModel, {
  foreignKey: "order_lab_uuid",
  as: "order_lab_pemeriksaan",
  constraints: false,
});

export default class OrderLabRepository {
  static async create(data, transaction) {
    return await OrderlabModel.create(data, { transaction });
  }

  static async findLatest() {
    return await OrderlabModel.findOne(
      {
        where: {
          deleted_at: {
            [Op.is]: null,
          },
        },
      },
      {
        order: [["noreg", "DESC"]],
      }
    );
  }

  static async findByUuid(uuid, faskes_uuid) {
    return await OrderlabModel.findOne({
      where: {
        uuid: uuid,
        faskes_uuid: faskes_uuid,
        deleted_at: {
          [Op.is]: null,
        },
      },
      include: [
        {
          model: OrderLabPemeriksaanModel,
          as: "order_lab_pemeriksaan",
          required: false,
          where: {
            deleted_at: {
              [Op.is]: null,
            },
          },
          include: [
            {
              model: TarifLabModel,
              as: "tarif_lab",
              where: {
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
            },
          ],
        },
      ],
      attributes :{
        exclude : ["created_at", "updated_at", "deleted_at"]
      }
    });
  }
}
