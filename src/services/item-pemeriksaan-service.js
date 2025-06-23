import ItemPemeriksaanRepository from "../repositories/item-pemeriksaan-repository.js";
import ItemPemeriksaanValidation from "../validations/item-pemeriksaan-validation.js";
import ZodValidator from "../validations/zod-validator.js";
import LoincRepository from "../repositories/loinc-repository.js";
import SnomedRepository from "../repositories/snomed-repository.js";
import Icd9Repository from "../repositories/icd9-repository.js";
import ConflictException from "../exception/conflict-exception.js";
import NotfoundException from "../exception/notfound-exception.js";
import PilihanHasilItemPemeriksaanRepository from "../repositories/pilihan-hasil-item-pemeriksaan-repository.js";
import CategoryPemeriksaanRepository from "../repositories/category-pemeriksaan-repository.js";
import NilaiRujukanValidation from "../validations/nilai-rujukan-validation.js";
import NilaiRujukanRepository from "../repositories/nilai-rujukan-repository.js";
import BadRequestException from "../exception/bad-request-exception.js";
import sequelizeInstance from "@adameds/model-sdk/instance";
import excel from "exceljs";
import checkDuplicate from "../helpers/check-duplicate.js";
import { uuidv7 } from "uuidv7";

export default class ItemPemeriksaanService {
  static async create(req) {
    const validData = ZodValidator.validate(
      ItemPemeriksaanValidation.CREATE,
      req
    );

    const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByCode(
      validData.code,
      validData.faskes_uuid
    );

    const isCategoryPemeriksaanExist =
      await CategoryPemeriksaanRepository.findByUuid(
        validData.category_pemeriksaan_uuid
      );

    if (!isCategoryPemeriksaanExist) {
      throw new NotfoundException("Category Pemeriksaan tidak ada");
    }

    if (isItemPemeriksaanExist) {
      throw new ConflictException(
        "Item Pemeriksaan dengan code tersebut telah digunakan"
      );
    }

    const isIoincExist = await LoincRepository.findByUuid(req.loinc_uuid);

    if (!isIoincExist) {
      console.log("404");
      throw new NotfoundException("Loinc tidak ada");
    }

    if (req.snomed_uuid) {
      const isSnomedExist = await SnomedRepository.find(req.snomed_uuid);
      if (!isSnomedExist) {
        throw new NotfoundException("Snomed tidak ada");
      }
    }

    if (req.icd9_uuid) {
      const isIcd9Exist = await Icd9Repository.find(req.icd9_uuid);
      if (!isIcd9Exist) {
        throw new NotfoundException("Icd9 tidak ada");
      }
    }

    await sequelizeInstance.transaction(async (t) => {
      const itemPemeriksaan = await ItemPemeriksaanRepository.create(
        validData,
        t
      );
      if (validData.jenis_input === "pilihan") {
        await PilihanHasilItemPemeriksaanRepository.create(
          {
            item_pemeriksaan_uuid: itemPemeriksaan.uuid,
            pilihan_hasil: validData.pilihan_hasil_item_pemeriksaans,
            faskes_uuid: validData.faskes_uuid,
          },
          t
        );
      }
    });
  }

  static async update(uuid, req) {
    const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(
      uuid
    );

    if (!isItemPemeriksaanExist) {
      throw new NotfoundException("Item Pemeriksaan tidak ada");
    }

    const isCategoryPemeriksaanExist =
      await CategoryPemeriksaanRepository.findByUuid(
        req.category_pemeriksaan_uuid
      );

    if (!isCategoryPemeriksaanExist) {
      throw new NotfoundException("Category Pemeriksaan tidak ada");
    }

    const validData = ZodValidator.validate(
      ItemPemeriksaanValidation.UPDATE,
      req
    );

    const isIoincExist = await LoincRepository.findByUuid(req.loinc_uuid);

    if (!isIoincExist) {
      throw new NotfoundException("Loinc tidak ada");
    }

    if (req.snomed_uuid) {
      const isSnomedExist = await SnomedRepository.find(req.snomed_uuid);
      if (!isSnomedExist) {
        throw new NotfoundException("Snomed tidak ada");
      }
    }

    if (req.icd9_uuid) {
      const isIcd9Exist = await Icd9Repository.find(req.icd9_uuid);
      if (!isIcd9Exist) {
        throw new NotfoundException("Icd9 tidak ada");
      }
    }

    await sequelizeInstance.transaction(async (t) => {
      await ItemPemeriksaanRepository.update(uuid, validData, t);
      if (validData.jenis_input === "pilihan") {
        await PilihanHasilItemPemeriksaanRepository.deleteByItemPemeriksaan(
          uuid,
          t
        );
        await PilihanHasilItemPemeriksaanRepository.create(
          {
            item_pemeriksaan_uuid: uuid,
            pilihan_hasil: validData.pilihan_hasil_item_pemeriksaans,
            faskes_uuid: validData.faskes_uuid,
          },
          t
        );
      }
    });
  }

  static async delete(uuid) {
    const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(
      uuid
    );

    if (!isItemPemeriksaanExist) {
      throw new NotfoundException("Item Pemeriksaan tidak ada");
    }

    await sequelizeInstance.transaction(async (t) => {
      await ItemPemeriksaanRepository.delete(uuid, t);

      if (isItemPemeriksaanExist.jenis_input === "pilihan") {
        await PilihanHasilItemPemeriksaanRepository.deleteByItemPemeriksaan(
          uuid,
          t
        );
      }
    });
  }

  static async show(uuid) {
    const itemPemeriksaan = await ItemPemeriksaanRepository.findByUuid(uuid);

    if (!itemPemeriksaan) {
      throw new NotfoundException("Item Pemeriksaan tidak ada");
    }

    return itemPemeriksaan;
  }

  static async findAll(req) {
    const itemPemeriksaan = await ItemPemeriksaanRepository.findAll(req);
    return itemPemeriksaan;
  }

  static async findAllActive(req) {
    const itemPemeriksaan = await ItemPemeriksaanRepository.findAllActive(req);
    return itemPemeriksaan;
  }

  static async createNilaiRujukan(req) {
    console.log("req", req.item_pemeriksaan_uuid);
    const validItemPemeriksaanUuid = ZodValidator.validate(
      NilaiRujukanValidation.PEMERIKSAAN_UUID,
      req.item_pemeriksaan_uuid
    );
    const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(
      validItemPemeriksaanUuid
    );

    if (!isItemPemeriksaanExist) {
      throw new NotfoundException("Item Pemeriksaan tidak ada");
    }

    let validata;
    if (isItemPemeriksaanExist.jenis_input == "angka") {
      validata = ZodValidator.validate(
        NilaiRujukanValidation.CREATE_ANGKA,
        req
      );
    } else if (
      isItemPemeriksaanExist.jenis_input === "text" ||
      isItemPemeriksaanExist.jenis_input === "long text"
    ) {
      validata = ZodValidator.validate(NilaiRujukanValidation.CREATE_TEXT, req);
    } else {
      throw new BadRequestException("Jenis input tidak valid");
    }

    await sequelizeInstance.transaction(async (t) => {
      await NilaiRujukanRepository.create(validata, t);
    });
  }

  static async findAllNilaiRujukan(item_pemeriksaan_uuid) {
    const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(
      item_pemeriksaan_uuid
    );

    if (!isItemPemeriksaanExist) {
      throw new NotfoundException("Item Pemeriksaan tidak ada");
    }

    return await NilaiRujukanRepository.findByItemPemeriksaan(
      item_pemeriksaan_uuid
    );
  }

  static async updateNilaiRujukan(uuid, req) {
    const isNilairujukanExist = await NilaiRujukanRepository.findByUuid(uuid);

    if (!isNilairujukanExist) {
      throw new NotfoundException("Nilai Rujukan tidak ada");
    }

    const validPemeriksaanUuid = ZodValidator.validate(
      NilaiRujukanValidation.PEMERIKSAAN_UUID,
      req.item_pemeriksaan_uuid
    );

    const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(
      validPemeriksaanUuid
    );

    if (!isItemPemeriksaanExist) {
      throw new NotfoundException("Item Pemeriksaan tidak ada");
    }

    let validata;

    if (isItemPemeriksaanExist.jenis_input == "angka") {
      validata = ZodValidator.validate(
        NilaiRujukanValidation.UPDATE_ANGKA,
        req
      );
    } else if (
      isItemPemeriksaanExist.jenis_input === "text" ||
      item_pemeriksaan_uuid.jenis_input === "long text"
    ) {
      validata = ZodValidator.validate(NilaiRujukanValidation.UPDATE_TEXT, req);
    } else {
      throw new BadRequestException("Jenis input tidak valid");
    }

    await sequelizeInstance.transaction(async (t) => {
      await NilaiRujukanRepository.update(uuid, validata, t);
    });
  }

  static async deleteNilaiRujukan(uuid) {
    const isNilairujukanExist = await NilaiRujukanRepository.findByUuid(uuid);

    if (!isNilairujukanExist) {
      throw new NotfoundException("Nilai Rujukan tidak ada");
    }

    await sequelizeInstance.transaction(async (t) => {
      await NilaiRujukanRepository.delete(uuid, t);
    });
  }

  static async showNilaiRujukan(uuid) {
    const isNilairujukanExist = await NilaiRujukanRepository.findByUuid(uuid);

    if (!isNilairujukanExist) {
      throw new NotfoundException("Nilai Rujukan tidak ada");
    }

    return isNilairujukanExist;
  }

  static async import(path, faskesUuid) {
    const data = [];

    const workbook = new excel.Workbook();
    await workbook.xlsx.readFile(path);
    const itemSheet = workbook.worksheets[0];
    if (!itemSheet) {
      throw new NotfoundException("Sheet Item Pemeriksaan tidak ditemukan");
    }

    const nilaiSheet = workbook.worksheets[1];

    itemSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      data.push({
        uuid: uuidv7(),
        code: row.values[2],
        name: row.values[3],
        no_urut: row.values[4],
        category_pemeriksaan: row.values[5],
        satuan: row.values[6],
        metode: row.values[7],
        jenis_input: String(row.values[8]).trim(),
        pilihan_hasil_item_pemeriksaans: row.values[9]
          ? String(row.values[9]).split(",")
          : [],
        snomed: row.values[10],
        icd9: row.values[11],
        loinc: row.values[12],
        status_nilai_rujukan: row.values[13] ? Boolean(row.values[13]) : false,
        status: true,
        faskes_uuid: faskesUuid,
      });
    });

    const loincNames = data.map((item) => item.loinc).filter(Boolean);
    const snomedNames = data.map((item) => item.snomed).filter(Boolean);
    const icd9Names = data.map((item) => item.icd9).filter(Boolean);
    const categoryPemeriksaanCodes = data.map(
      (item) => item.category_pemeriksaan
    );

    const [loincList, snomedList, icd9List, categoryPemeriksaanList] =
      await Promise.all([
        LoincRepository.findByNameIn(loincNames),
        SnomedRepository.findByNameIn(snomedNames),
        Icd9Repository.findByNameIn(icd9Names),
        CategoryPemeriksaanRepository.findByCodeIn(
          categoryPemeriksaanCodes,
          faskesUuid
        ),
      ]);

    // Buat lookup table untuk pencarian cepat
    const loincMap = new Map(loincList.map((item) => [item.name, item.uuid]));
    const snomedMap = new Map(snomedList.map((item) => [item.name, item.uuid]));
    const icd9Map = new Map(icd9List.map((item) => [item.name, item.uuid]));
    const categoryMap = new Map(
      categoryPemeriksaanList.map((item) => [item.code, item.uuid])
    );

    // Update data dengan UUID yang sesuai
    data.forEach((item) => {
      if (item.loinc) {
        if (!loincMap.has(item.loinc))
          throw new NotfoundException("Loinc tidak ada");
        item.loinc_uuid = loincMap.get(item.loinc);
        delete item.loinc;
      }

      if (item.snomed) {
        if (!snomedMap.has(item.snomed))
          throw new NotfoundException("Snomed tidak ada");
        item.snomed_uuid = snomedMap.get(item.snomed);
        delete item.snomed;
      }

      if (item.icd9) {
        if (!icd9Map.has(item.icd9))
          throw new NotfoundException("Icd9 tidak ada");
        item.icd9_uuid = icd9Map.get(item.icd9);
        delete item.icd9;
      }

      if (item.category_pemeriksaan) {
        if (!categoryMap.has(item.category_pemeriksaan))
          throw new NotfoundException("Category Pemeriksaan tidak ada");
        item.category_pemeriksaan_uuid = categoryMap.get(
          item.category_pemeriksaan
        );
        delete item.category_pemeriksaan;
      }
    });

    checkDuplicate(data);

    data.map((item) => {
      ZodValidator.validate(ItemPemeriksaanValidation.CREATE, item);
    });

    const nilaiData = [];
    if (nilaiSheet) {
      nilaiSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1 || rowNumber == 2) return;
        const itemPemeriksaanUuid = data.find(
          (item) => item.code === row.values[2]
        )?.uuid;
        if (!itemPemeriksaanUuid)
          throw new NotfoundException("Item Pemeriksaan tidak ada");

        const nilaiNormalText = row.values[17]
          ? String(row.values[17])
              .split(",")
              .map((i) => i.trim())
          : [];

        const itemNilaiData = {
          item_pemeriksaan_uuid: itemPemeriksaanUuid,
          jenis_kelamin: String(row.values[3]).trim().toLowerCase(),
          umur_bawah_tahun: row.values[4],
          umur_bawah_bulan: row.values[5],
          umur_bawah_hari: row.values[6],
          umur_atas_tahun: row.values[7],
          umur_atas_bulan: row.values[8],
          umur_atas_hari: row.values[9],
          batas_bawah_nilai_normal: row.values[10],
          operator_nilai_normal: row.values[11],
          batas_atas_nilai_normal: row.values[12],
          kritis_bawah: row.values[13],
          operator_kritis_bawah: row.values[14],
          kritis_atas: row.values[15],
          operator_kritis_atas: row.values[16],
          nilai_normal_text: nilaiNormalText,
          status: Boolean(row.values[18].trim()),
          faskes_uuid: faskesUuid,
        };

        if (nilaiNormalText.length === 0) {
          if (itemNilaiData.operator_nilai_normal == "-") {
            itemNilaiData.tampilan = `${itemNilaiData.batas_bawah_nilai_normal} - ${itemNilaiData.batas_atas_nilai_normal}`;
          } else if (
            itemNilaiData.operator_nilai_normal == "<=" ||
            itemNilaiData.operator_nilai_normal == "<"
          ) {
            itemNilaiData.tampilan = `${itemNilaiData.operator_nilai_normal} ${itemNilaiData.batas_atas_nilai_normal}`;
          } else {
            itemNilaiData.tampilan = `${itemNilaiData.operator_nilai_normal} ${itemNilaiData.batas_bawah_nilai_normal}`;
          }
        } else {
          itemNilaiData.tampilan = row.values[17];
        }

        nilaiData.push(itemNilaiData);
      });

      nilaiData.map((item) => {
        if (item.nilai_normal_text.length > 0) {
          ZodValidator.validate(NilaiRujukanValidation.CREATE_TEXT, item);
        } else {
          ZodValidator.validate(NilaiRujukanValidation.CREATE_ANGKA, item);
        }
      });
    }

    await sequelizeInstance.transaction(async (t) => {
      await ItemPemeriksaanRepository.bulckCreate(data, t);

      if (nilaiSheet) {
        await NilaiRujukanRepository.bulkCreate(nilaiData, t);
      }
    });
  }
}
