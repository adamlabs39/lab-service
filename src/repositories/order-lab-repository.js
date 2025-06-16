import {
  ItemKelompokPemeriksaanModel,
  ItemPemeriksaanModel,
  KelompokPemeriksaanModel,
  ObservationItemModel,
  OrderLabModel,
  OrderLabPemeriksaanModel,
  TarifLabItemModel,
  TarifLabModel,
  TarifLabPelayananModel,
  TarifLabPenjaminModel,
} from "@adameds/model-sdk/lab";
import { Op } from "sequelize";
import {
  KabupatenModel,
  KecamatanModel,
  KelurahanModel,
  LokasiModel,
  PegawaiModel,
  PenjaminModel,
  PractitionerModel,
  ProvinceModel,
} from "@adameds/model-sdk/datamaster";
import pagination from "../helpers/pagination.js";
import {
  BirthDetailModel,
  InsuranceAccountModel,
  PatientModel,
} from "@adameds/model-sdk/admisi";
import { AddressModel } from "@adameds/model-sdk/setting";
import { status } from "../services/order-lab-service.js";
import Utils from "../helpers/utils.js";

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

OrderLabModel.belongsTo(PractitionerModel, {
  foreignKey: "petugas_order",
  as: "petugasOrder",
  constraints: false,
});

OrderLabModel.belongsTo(PractitionerModel, {
  foreignKey: "practitioner_uuid",
  as: "practitioner",
  constraints: false,
});

OrderLabModel.belongsTo(PenjaminModel, {
  foreignKey: "penjamin_uuid",
  as: "penjamin",
  constraints: false,
});

OrderLabModel.hasMany(ObservationItemModel, {
  foreignKey: "order_lab_uuid",
  as: "observation_items",
  constraints: false,
});

AddressModel.belongsTo(ProvinceModel, {
  as: "provData",
  foreignKey: "prov",
  targetKey: "code",
});
AddressModel.belongsTo(KabupatenModel, {
  as: "cityData",
  foreignKey: "city",
  targetKey: "code",
});
AddressModel.belongsTo(KecamatanModel, {
  as: "districtData",
  foreignKey: "district",
  targetKey: "code",
});
AddressModel.belongsTo(KelurahanModel, {
  as: "villageData",
  foreignKey: "village",
  targetKey: "code",
});
PatientModel.hasMany(InsuranceAccountModel, {
  as: "insurance_account",
  foreignKey: "patient_uuid",
  constraints: false,
});

export default class OrderLabRepository {
  static async create(data, transaction) {
    return await OrderLabModel.create(data, { transaction });
  }

  static async findLatest() {
    return await OrderLabModel.findOne(
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
    return await OrderLabModel.findOne({
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
          attributes: {
            exclude: ["created_at", "updated_at", "deleted_at"],
          },
          include: [
            {
              model: TarifLabModel,
              as: "tarif_lab",
              required: false,
              where: {
                deleted_at: {
                  [Op.is]: null,
                },
              },
              attributes: {
                exclude: ["created_at", "updated_at", "deleted_at"],
              },
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
              include: [
                {
                  model: ProvinceModel,
                  as: "provData",
                  attributes: ["code", "name"],
                },
                {
                  model: KabupatenModel,
                  as: "cityData", // Diubah dari "city" untuk menghindari konflik
                  attributes: ["code", "name"],
                },
                {
                  model: KecamatanModel,
                  as: "districtData", // Diubah dari "district" untuk menghindari konflik
                  attributes: ["code", "name"],
                },
                {
                  model: KelurahanModel,
                  as: "villageData", // Diubah dari "village" untuk menghindari konflik
                  attributes: ["code", "name"],
                },
              ],
              attributes: [
                "uuid",
                "full_address",
                "rt",
                "rw",
                "postalCode",
                "country",
              ],
            },
            {
              model: BirthDetailModel,
              as: "birth_detail",
              where: {
                deleted_at: {
                  [Op.is]: null,
                },
              },
              attributes: [
                "uuid",
                "birth_place",
                "birth_date",
                "age_year",
                "age_month",
                "age_day",
              ],
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
              attributes: ["uuid", "name", "first_title", "last_title"],
            },
          ],
          where: {
            deleted_at: {
              [Op.is]: null,
            },
          },
          attributes: ["uuid", "code_bpjs", "satu_sehat_id"],
        },
        {
          model: PractitionerModel,
          as: "practitioner",
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
              attributes: ["uuid", "name", "first_title", "last_title"],
            },
          ],
          where: {
            deleted_at: {
              [Op.is]: null,
            },
          },
          attributes: ["uuid", "code_bpjs", "satu_sehat_id"],
        },
      ],
      attributes: {
        exclude: ["id", "created_at", "updated_at", "deleted_at"],
      },
    });
  }

  static async findAll(req) {
    // 1. Validasi & Sanitasi Input
    const {
      order_status,
      start_date,
      end_date,
      search,
      payment_method,
      faskes_uuid,
      page = 1,
      limit = 10,
    } = req;

    // Validasi pagination
    const safePage = isNaN(parseInt(page)) ? 1 : Math.max(parseInt(page), 1);
    const safeLimit = isNaN(parseInt(limit))
      ? 10
      : Math.min(parseInt(limit), 100);

    // 2. Build WHERE clause utama
    const where = {
      faskes_uuid: {
        [Op.eq]: faskes_uuid,
      },
      deleted_at: {
        [Op.is]: null,
      },
    };

    // 3. Filter Status Order
    if (order_status) {
      where.order_status = {
        [Op.eq]: order_status,
      };
    }

    // 4. Filter Payment Method
    if (payment_method) {
      where.payment_method = {
        [Op.eq]: payment_method,
      };
    }

    // 5. Filter Tanggal dengan validasi
    if (start_date || end_date) {
      where.tgl_order = {};

      if (start_date) {
        where.tgl_order[Op.gte] = start_date;
      }

      if (end_date) {
        where.tgl_order[Op.lte] = end_date;
      }
    }

    // 6. Search dengan parameterized query
    if (search) {
      where[Op.or] = [
        { no_rm: { [Op.iLike]: `%${search}%` } },
        OrderLabModel.sequelize.where(
          OrderLabModel.sequelize.col("patient.name"),
          {
            [Op.iLike]: `%${search}%`,
          }
        ),
        OrderLabModel.sequelize.where(
          OrderLabModel.sequelize.col("patient.address.full_address"),
          {
            [Op.iLike]: `%${search}%`,
          }
        ),
      ];
    }

    // 7. Optimasi Include Model untuk Pagination
    const include = [
      {
        model: PatientModel,
        as: "patient",
        attributes: ["uuid", "name", "no_rm", "gender", "phone"],
        where: { deleted_at: { [Op.is]: null } },
        required: false,
        include: [
          {
            model: AddressModel,
            as: "address",
            attributes: ["full_address", "rt", "rw"],
            where: { deleted_at: { [Op.is]: null } },
            include: [
              {
                model: ProvinceModel,
                as: "provData",
                attributes: ["code", "name"],
              },
              {
                model: KabupatenModel,
                as: "cityData", // Diubah dari "city" untuk menghindari konflik
                attributes: ["code", "name"],
              },
              {
                model: KecamatanModel,
                as: "districtData", // Diubah dari "district" untuk menghindari konflik
                attributes: ["code", "name"],
              },
              {
                model: KelurahanModel,
                as: "villageData", // Diubah dari "village" untuk menghindari konflik
                attributes: ["code", "name"],
              },
            ],
          },
          {
            model: BirthDetailModel,
            as: "birth_detail",
            attributes: [
              "birth_place",
              "birth_date",
              "age_year",
              "age_month",
              "age_day",
            ],
          },
          {
            model: InsuranceAccountModel,
            as: "insurance_account",
            attributes: ["name", "account_number", "class_entitle"],
            required: false,
          },
        ],
      },
      {
        model: LokasiModel,
        as: "lokasi",
        attributes: ["code", "name"],
        required: false,
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
            attributes: ["uuid", "name", "first_title", "last_title"],
          },
        ],
        where: {
          deleted_at: {
            [Op.is]: null,
          },
        },
        attributes: ["code_bpjs", "satu_sehat_id"],
      },
      {
        model: PenjaminModel,
        as: "penjamin",
        attributes: ["code", "name"],
        required: false,
      },
      // {
      //   model: OrderLabPemeriksaanModel,
      //   as: "order_lab_pemeriksaan",
      //   attributes: ["uuid"],
      //   required: false,
      //   where: { deleted_at: { [Op.is]: null } },
      // },
    ];

    // 8. Konfigurasi Query untuk Pagination Helper
    const options = {
      where,
      include,
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
        include: [
          // atau Cara 2: Lewat model
          [OrderLabModel.sequelize.col("patient.name"), "patient_name"],
          [
            OrderLabModel.sequelize.col("patient.address.full_address"),
            "patient_address",
          ],
        ],
      },
      order: [["tgl_order", "DESC"]],
    };

    try {
      const result = await pagination(
        OrderLabModel,
        { page: safePage, limit: safeLimit },
        options
      );

      return result;
    } catch (error) {
      console.error("Pagination Error:", error);
      throw new Error("Failed to fetch paginated orders");
    }
  }

  static async updateBatalOrder(uuids, data, transaction) {
    return await OrderLabModel.update(
      data,
      {
        where: {
          uuid: {
            [Op.in]: uuids,
          },
          deleted_at: {
            [Op.is]: null,
          },
        },
      },
      { transaction }
    );
  }

  static async findByUuids(uuids, faskes_uuid) {
    return await OrderLabModel.findAll({
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

  static async update(uuid, faskes_uuid, data, transaction) {
    console.log(data);
    return await OrderLabModel.update(
      data,
      {
        where: {
          uuid: uuid,
          deleted_at: {
            [Op.is]: null,
          },
        },
      },
      { transaction }
    );
  }

  static async findAllSelesai({
    start_date,
    end_date,
    search,
    pelayanan,
    faskes_uuid,
    page,
    limit,
  }) {
    const baseWhere = {
      faskes_uuid,
      order_status: status.SELESAI,
      deleted_at: { [Op.is]: null },
    };

    // Filter tanggal
    if (start_date || end_date) {
      baseWhere.tgl_order = {};
      if (start_date) baseWhere.tgl_order[Op.gte] = start_date;
      if (end_date) baseWhere.tgl_order[Op.lte] = end_date;
    }

    // Filter pelayanan
    if (pelayanan) {
      baseWhere.pelayanan = pelayanan;
    }

    // Pencarian
    if (search) {
      baseWhere[Op.or] = [
        { no_rm: { [Op.iLike]: `%${search}%` } },
        { noreg: { [Op.iLike]: `%${search}%` } },
        { "$patient.name$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    const includeOptions = [
      {
        model: OrderLabPemeriksaanModel,
        as: "order_lab_pemeriksaan",
        required: false,
        where: { deleted_at: { [Op.is]: null } },
        include: [
          {
            model: TarifLabModel,
            as: "tarif_lab",
            required: false,
            where: { deleted_at: { [Op.is]: null } },
            attributes: ["uuid", "name", "grand_total"],
            include: [
              {
                model: TarifLabPenjaminModel,
                as: "tarif_lab_penjamin",
                required: false,
                where: { deleted_at: { [Op.is]: null } },
                attributes: {
                  exclude: ["created_at", "updated_at", "deleted_at"],
                },
                include: {
                  model: PenjaminModel,
                  as: "penjamin",
                  required: false,
                  where: { deleted_at: { [Op.is]: null } },
                  attributes: ["uuid", "name"],
                },
              },
              {
                model: TarifLabPelayananModel,
                as: "pelayanan",
                required: false,
                where: { deleted_at: { [Op.is]: null } },
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
        attributes: { exclude: ["created_at", "updated_at", "deleted_at"] },
      },
      {
        model: PatientModel,
        as: "patient",
        required: false,
        where: { deleted_at: { [Op.is]: null } },
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "deletedAt",
            "language",
            "motherName",
            "religion",
            "maritialStatus",
            "address_uuid",
            "birth_detail_uuid",
            "addressUuid",
            "birthDetailUuid",
          ],
        },
        include: [
          {
            model: AddressModel,
            as: "address",
            required: false,
            where: { deleted_at: { [Op.is]: null } },
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          },
          {
            model: BirthDetailModel,
            as: "birth_detail",
            required: false,
            where: { deleted_at: { [Op.is]: null } },
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          },
        ],
      },
      {
        model: LokasiModel,
        as: "lokasi",
        required: false,
        attributes: ["uuid", "name"],
        where: { deleted_at: { [Op.is]: null } },
      },
      {
        model: PractitionerModel,
        as: "dokterPengirim",
        required: false,
        include: [
          {
            model: PegawaiModel,
            as: "pegawai",
            required: false,
            where: { deleted_at: { [Op.is]: null } },
            attributes: ["uuid", "name"],
          },
        ],
        where: { deleted_at: { [Op.is]: null } },
        attributes: ["uuid", "is_doctor", "code_antrian_dokter"],
      },
    ];

    // Untuk query data
    const dataOptions = {
      where: baseWhere,
      include: includeOptions,
      attributes: {
        exclude: [
          "created_at",
          "updated_at",
          "deleted_at",
          "patient_uuid",
          "penjamin_uuid",
          "lokasi_uuid",
          "dokter_pengirim_uuid",
          "status_puasa",
          "practitioner_uuid",
          "spesimen_uuids",
        ],
      },
      limit: limit,
      offset: (page - 1) * limit,
      order: [["tgl_order", "DESC"]], // Pastikan ada order by untuk konsistensi
    };

    try {
      // Pertama, hitung total records dengan query sederhana
      const total = await OrderLabModel.count({
        where: baseWhere,
        distinct: true,
        col: "uuid", // Pastikan menggunakan kolom utama
      });

      // Kemudian ambil data dengan include lengkap
      const data = await OrderLabModel.findAll(dataOptions);

      return {
        data: data,
        pagination: Utils.paginationHelper(page, limit, total),
      };
    } catch (error) {
      console.error("Error in findAllSelesai:", error);
      throw error;
    }
  }
}
