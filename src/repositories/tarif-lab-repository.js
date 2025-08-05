import {
  ItemKelompokPemeriksaanModel,
  ItemPemeriksaanModel,
  KelompokPemeriksaanModel,
  TarifLabItemModel,
  TarifLabModel,
  TarifLabPelayananModel,
  TarifLabPenjaminModel,
  TarifKomponenTindakanLabModel,
  CategoryPemeriksaanModel,
} from "@adameds/model-sdk/lab";
import { Op } from "sequelize";
import toEpochDate from "../helpers/date-helper.js";
import {
  NameTarifKomponenModel,
  PenjaminModel,
} from "@adameds/model-sdk/datamaster";
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
    // 1. Query utama untuk mendapatkan data TarifLab dengan pagination
    const mainQueryOptions = {
      where: {
        faskes_uuid: req.faskes_uuid,
        name: { [Op.iLike]: `%${req.name || ""}%` },
        deleted_at: { [Op.is]: null },
      },
      order: [["created_at", "DESC"]],
      attributes: { exclude: ["created_at", "updated_at", "deleted_at"] },
    };

    // Eksekusi query utama dengan pagination
    const { data: mainData, pagination: paginationInfo } = await pagination(
      TarifLabModel,
      req,
      mainQueryOptions
    );

    // Jika tidak ada data, kembalikan response kosong
    if (mainData.length === 0) {
      return { data: [], pagination: paginationInfo };
    }

    // 2. Ambil semua relasi untuk data yang sudah dipaginasi
    const uuids = mainData.map((item) => item.uuid);

    // Query untuk tarif_lab_penjamin dengan penjamin
    const tarifPenjamin = await TarifLabPenjaminModel.findAll({
      where: {
        tarif_lab_uuid: { [Op.in]: uuids },
        deleted_at: { [Op.is]: null },
        ...(req.penjamin_uuids?.length > 0 && {
          uuid: { [Op.in]: req.penjamin_uuids },
        }),
      },
      include: [
        {
          model: PenjaminModel,
          as: "penjamin",
          where: { deleted_at: { [Op.is]: null } },
          attributes: ["uuid", "name"],
        },
      ],
      raw: true,
      nest: true,
    });

    // Query untuk pelayanan
    const pelayanan = await TarifLabPelayananModel.findAll({
      where: {
        tarif_lab_uuid: { [Op.in]: uuids },
        deleted_at: { [Op.is]: null },
        ...(req.pelayanans?.length > 0 && {
          uuid: { [Op.in]: req.pelayanans },
        }),
      },
      attributes: ["uuid", "pelayanan", "tarif_lab_uuid"],
      raw: true,
    });

    // Query untuk Ambil tarif items
    const tarifItems = await TarifLabItemModel.findAll({
      where: {
        tarif_lab_uuid: { [Op.in]: uuids },
        deleted_at: { [Op.is]: null },
      },
      include: [
        {
          model: KelompokPemeriksaanModel,
          as: "kelompok_pemeriksaan",
          required: false, // Penting: biarkan tetap muncul meski relasi kosong
          where: { deleted_at: { [Op.is]: null } },
          attributes: ["uuid", "name"],
        },
        {
          model: ItemPemeriksaanModel,
          as: "item_pemeriksaan",
          required: false, // Penting: biarkan tetap muncul meski relasi kosong
          where: { deleted_at: { [Op.is]: null } },
          attributes: ["uuid", "name"],
        },
      ],
      raw: true,
      nest: true,
    });

    const tarifItemUuids = tarifItems.map((item) => item.uuid);

    // Bagi tarifItemUuids menjadi chunk kecil
    const CHUNK_SIZE = 100; // Sesuaikan dengan kebutuhan
    const chunks = [];
    for (let i = 0; i < tarifItemUuids.length; i += CHUNK_SIZE) {
      chunks.push(tarifItemUuids.slice(i, i + CHUNK_SIZE));
    }

    // Query per chunk
    const komponenTindakan = (
      await Promise.all(
        chunks.map((chunk) =>
          TarifKomponenTindakanLabModel.findAll({
            where: {
              tarif_lab_item_uuid: { [Op.in]: chunk },
              deleted_at: { [Op.is]: null },
            },
            include: [
              {
                model: NameTarifKomponenModel,
                as: "tarif_komponen",
                where: { deleted_at: { [Op.is]: null } },
                attributes: ["uuid", "name"],
              },
            ],
          })
        )
      )
    ).flat();

    // Proses penggabungan tarif item & komponen tarif
    const tarifItemsWithComponents = tarifItems.map((item, index) => {
      // console.log(
      //   `Processing tarif item ${index + 1}/${tarifItems.length}`,
      //   item.uuid
      // );

      const components = komponenTindakan
        .filter((kt) => {
          const isMatch = kt.tarif_lab_item_uuid === item.uuid;
          // if (!isMatch) {
          //   console.log(
          //     `Komponen ${kt.uuid} tidak cocok dengan item ${item.uuid}`
          //   );
          // }
          return isMatch;
        })
        .map((kt) => ({
          uuid: kt.uuid,
          name: kt.tarif_komponen?.name || null,
          prosentase: kt.prosentase_per_komponen,
          tarif: kt.tarif_per_komponen,
        }));

      // console.log(
      //   `Found ${components.length} components for item ${item.uuid}`
      // );

      return {
        ...item,
        komponen_tarif: components,
      };
    });

    // 3. Gabungkan semua data
    const enrichedData = mainData.map((tarifLab) => {
      return {
        ...tarifLab,
        tarif_lab_penjamin: tarifPenjamin.filter(
          (item) => item.tarif_lab_uuid === tarifLab.uuid
        ),
        pelayanan: pelayanan.filter(
          (item) => item.tarif_lab_uuid === tarifLab.uuid
        ),
        tarif_lab_item: tarifItemsWithComponents.filter(
          (item) => item.tarif_lab_uuid === tarifLab.uuid
        ),
      };
    });

    return {
      data: enrichedData,
      pagination: paginationInfo,
    };
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

  static async findByCodeWithoutItself(uuid, req) {
    return await TarifLabModel.findOne({
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

  static async findAllActive(req) {
    // 1. Query utama untuk mendapatkan data TarifLab dengan pagination
    const mainData = await TarifLabModel.findAll({
      where: {
        faskes_uuid: req.faskes_uuid,
        name: { [Op.iLike]: `%${req.name || ""}%` },
        deleted_at: { [Op.is]: null },
      },
      distinct: true,
      subQuery: false,
      order: [["created_at", "DESC"]],
      attributes: { exclude: ["created_at", "updated_at", "deleted_at"] },
      raw: true,
    });

    // Jika tidak ada data, kembalikan response kosong
    if (mainData.length === 0) {
      return { data: [] };
    }

    // 2. Ambil semua relasi
    const uuids = mainData.map((item) => item.uuid);

    // Query untuk Ambil tarif items
    const tarifItems = await TarifLabItemModel.findAll({
      where: {
        tarif_lab_uuid: { [Op.in]: uuids },
        deleted_at: { [Op.is]: null },
      },
      include: [
        {
          model: KelompokPemeriksaanModel,
          as: "kelompok_pemeriksaan",
          required: false, // Penting: biarkan tetap muncul meski relasi kosong
          where: { deleted_at: { [Op.is]: null } },
          attributes: ["uuid", "name"],
          include: [
            // Tambahkan relasi category untuk kelompok pemeriksaan
            {
              model: CategoryPemeriksaanModel,
              as: "category_pemeriksaan",
              required: false,
              attributes: ["code", "name", "no_urut"], // Ambil code dan name dari category
            },
          ],
        },
        {
          model: ItemPemeriksaanModel,
          as: "item_pemeriksaan",
          required: false, // Penting: biarkan tetap muncul meski relasi kosong
          where: { deleted_at: { [Op.is]: null } },
          attributes: ["uuid", "name"],
          include: [
            // Tambahkan relasi category untuk kelompok pemeriksaan
            {
              model: CategoryPemeriksaanModel,
              as: "category_pemeriksaan",
              required: false,
              attributes: ["code", "name", "no_urut"], // Ambil code dan name dari category
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });

    // console.log("tarif items ==> ", JSON.stringify(tarifItems));

    tarifItems.map((item) => {
      item.kelompok_pemeriksaan = item.kelompok_pemeriksaan_uuid
        ? item.kelompok_pemeriksaan
        : null;
      item.item_pemeriksaan = item.item_pemeriksaan_uuid
        ? item.item_pemeriksaan
        : null;
    });

    // 3. Gabungkan semua data
    const enrichedData = mainData.map((tarifLab) => {
      return {
        ...tarifLab,
        tarif_lab_item: tarifItems.filter(
          (item) => item.tarif_lab_uuid === tarifLab.uuid
        ),
      };
    });

    return {
      data: enrichedData,
      // pagination: paginationInfo,
    };
  }
}
