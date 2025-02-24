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
import {
  LokasiModel,
  PegawaiModel,
  PenjaminModel,
  PractitionerModel,
} from "@adameds/model-sdk/datamaster";
import pagination from "../helpers/pagination.js";
import { BirthDetailModel, PatientModel } from "@adameds/model-sdk/admisi";
import { AddressModel } from "@adameds/model-sdk/setting";

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

OrderLabModel.belongsTo(PatientModel, {
  foreignKey: "patient_uuid",
  as: "patient",
  constraints: false,
});

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
      // include: [
      //   {
      //     model: OrderLabPemeriksaanModel,
      //     as: "order_lab_pemeriksaan",
      //     required: false,
      //     where: {
      //       deleted_at: {
      //         [Op.is]: null,
      //       },
      //     },
      //     include: [
      //       {
      //         model: TarifLabModel,
      //         as: "tarif_lab",
      //         where: {
      //           deleted_at: {
      //             [Op.is]: null,
      //           },
      //         },
      //         include: [
      //           {
      //             model: TarifLabPenjaminModel,
      //             as: "tarif_lab_penjamin",
      //             where: {
      //               deleted_at: {
      //                 [Op.is]: null,
      //               },
      //             },

      //             include: {
      //               model: PenjaminModel,
      //               as: "penjamin",
      //               where: {
      //                 deleted_at: {
      //                   [Op.is]: null,
      //                 },
      //               },
      //               attributes: ["uuid", "name"],
      //             },
      //           },
      //           {
      //             model: TarifLabPelayananModel,
      //             as: "pelayanan",
      //             where: {
      //               deleted_at: {
      //                 [Op.is]: null,
      //               },
      //             },
      //             attributes: ["uuid", "pelayanan"],
      //           },
      //           {
      //             model: TarifLabItemModel,
      //             as: "tarif_lab_item",
      //             include: [
      //               {
      //                 model: KelompokPemeriksaanModel,
      //                 as: "kelompok_pemeriksaan",
      //                 attributes: ["uuid", "name"],
      //               },
      //               {
      //                 model: ItemPemeriksaanModel,
      //                 as: "item_pemeriksaan",
      //                 attributes: ["uuid", "name"],
      //               },
      //             ],
      //           },
      //         ],
      //       },
      //     ],
      //   },
      //   {
      //     model: PatientModel,
      //     as: "patient",
      //     where: {
      //       deleted_at: {
      //         [Op.is]: null,
      //       },
      //     },
      //     attributes: {
      //       exclude: ["createdAt", "updatedAt", "deletedAt"],
      //     },
      //     include: [
      //       {
      //         model: AddressModel,
      //         as: "address",
      //         where: {
      //           deleted_at: {
      //             [Op.is]: null,
      //           },
      //         },
      //         attributes: {
      //           exclude: ["createdAt", "updatedAt", "deletedAt"],
      //         },
      //       },
      //       {
      //         model: BirthDetailModel,
      //         as: "birth_detail",
      //         where: {
      //           deleted_at: {
      //             [Op.is]: null,
      //           },
      //         },
      //         attributes: {
      //           exclude: ["createdAt", "updatedAt", "deletedAt"],
      //         },
      //       },
      //     ],
      //   },
      //   {
      //     model: LokasiModel,
      //     as: "lokasi",
      //     attributes: ["uuid", "name"],
      //     where: {
      //       deleted_at: {
      //         [Op.is]: null,
      //       },
      //     },
      //   },
      //   {
      //     model: PractitionerModel,
      //     as: "dokterPengirim",
      //     required: false,
      //     include: [
      //       {
      //         model: PegawaiModel,
      //         as: "pegawai",
      //         where: {
      //           deleted_at: {
      //             [Op.is]: null,
      //           },
      //         },
      //         attributes: ["uuid", "name"],
      //       },
      //     ],
      //     where: {
      //       deleted_at: {
      //         [Op.is]: null,
      //       },
      //     },
      //     exclude: ["created_at", "updated_at", "deleted_at"],
      //   },
      // ],
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
    });
  }

  static async findAll(req) {
    const whereOrderStatus = {};

    if (req.order_status) {
      whereOrderStatus.order_status = req.order_status;
    }

    const whereDate = {};

    if (req.start_date || req.end_date) {
      whereDate.tgl_order = {};

      if (req.start_date) {
        whereDate.tgl_order[Op.gte] = req.start_date;
      }

      if (req.end_date) {
        whereDate.tgl_order[Op.lte] = req.end_date;
      }
    }

    const whereSearch = {};

    if (req.search) {
      whereSearch[Op.or] = [
        {
          no_rm: {
            [Op.iLike]: `%${req.search}%`,
          },
        //   '$patient.name$': {
        //     [Op.iLike]: `%${req.search}%`,
        //   },
        //   '$patient.address.full_address$': {
        //     [Op.iLike]: `%${req.search}%`,
        //   }
        },
      ];
    }

    const wherePayemntMethod = {}

    if (req.payment_method) {
      wherePayemntMethod.payment_method = req.payment_method;
    }

    const options = {
      where: {
        faskes_uuid: req.faskes_uuid,
        // ...whereSearch,
        // ...whereOrderStatus,
        // ...whereDate,
        // ...wherePayemntMethod,
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
                  require : false,
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
        {
          model: PatientModel,
          as: "patient",
          where: {
            deleted_at: {
              [Op.is]: null,
            },
          },
          attributes: {
            exclude: ["createdAt", "updatedAt", "deletedAt"],
          },
          include: [
            {
              model: AddressModel,
              as: "address",
              where: {
                deleted_at: {
                  [Op.is]: null,
                },
              },
              attributes: {
                exclude: ["createdAt", "updatedAt", "deletedAt"],
              },
            },
            {
              model: BirthDetailModel,
              as: "birth_detail",
              where: {
                deleted_at: {
                  [Op.is]: null,
                },
              },
              attributes: {
                exclude: ["createdAt", "updatedAt", "deletedAt"],
              },
            },
          ],
        },
        {
          model: LokasiModel,
          as: "lokasi",
          attributes: ["uuid", "name"],
          where: {
            deleted_at: {
              [Op.is]: null,
            },
          },
        },
        {
          model: PractitionerModel,
          as: "dokterPengirim",
          required: false,
          include: [
            {
              model: PegawaiModel,
              as: "pegawai",
              where: {
                deleted_at: {
                  [Op.is]: null,
                },
              },
              attributes: ["uuid", "name"],
            },
          ],
          where: {
            deleted_at: {
              [Op.is]: null,
            },
          },
          exclude: ["created_at", "updated_at", "deleted_at"],
        },
      ],
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
    };

    return await pagination(OrderlabModel, req, options);
  }

  static async updateBatalOrder(uuids, data, transaction) {
    return await OrderlabModel.update(data, {
      where: { 
        uuid: {
          [Op.in]: uuids,
        },
        deleted_at: {
          [Op.is]: null,
        },
       },
    }, { transaction });
  }

  static async findByUuids(uuids, faskes_uuid) {
    return await OrderlabModel.findAll({
      where: {
        uuid: {
          [Op.in]: uuids,
        },
        faskes_uuid: faskes_uuid,
        deleted_at: {
          [Op.is]: null,
        },
      },
    });
  }

  static async update(uuid, faskes_uuid,data,transaction) {
    return await OrderlabModel.update(data, {
      where: { uuid: uuid, deleted_at : {
        [Op.is]: null,
      } },
    }, { transaction });
  }
}
