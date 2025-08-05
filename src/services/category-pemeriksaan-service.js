import sequelizeInstance from "@adameds/model-sdk/instance";
import ConflictException from "../exception/conflict-exception.js";
import NotfoundException from "../exception/notfound-exception.js";
import CategoryPemeriksaanRepository from "../repositories/category-pemeriksaan-repository.js";
import CategoryPemeriksaanValidation from "../validations/category-pemeriksaan-validation.js";
import ZodValidator from "../validations/zod-validator.js";
import extractExcel from "../helpers/extract-excel.js";
import checkDuplicate from "../helpers/check-duplicate.js";

export default class CategoryPemeriksaanService {
  static async create(req) {
    const validData = ZodValidator.validate(
      CategoryPemeriksaanValidation.CREATE,
      req
    );

    const isCategoryPemeriksaanExist =
      await CategoryPemeriksaanRepository.findByCode(
        validData.code,
        validData.faskes_uuid
      );

    if (isCategoryPemeriksaanExist) {
      throw new ConflictException("Kode sudah ada");
    }

    const noUrutExist = await CategoryPemeriksaanRepository.findByNoUrut(
      validData.no_urut,
      validData.faskes_uuid
    );

    if (noUrutExist) {
      throw new ConflictException("Nomor urut sudah digunakan");
    }

    sequelizeInstance.transaction(async (t) => {
      await CategoryPemeriksaanRepository.create(validData, t);
    });
  }

  static async update(uuid, data) {
    const isCategoryPemeriksaanExist =
      await CategoryPemeriksaanRepository.findByUuid(uuid);

    if (!isCategoryPemeriksaanExist) {
      throw new NotfoundException("Category Pemeriksaan tidak ada");
    }

    const isCodeExist =
      await CategoryPemeriksaanRepository.findByCodeWithoutItself(data);

    if (isCodeExist) {
      throw new ConflictException("Kode sudah ada");
    }

    const noUrutExist =
      await CategoryPemeriksaanRepository.findByNoUrutWithUuid(uuid, data);
    if (noUrutExist) {
      throw new ConflictException("Nomor urut sudah digunakan");
    }

    const validData = ZodValidator.validate(
      CategoryPemeriksaanValidation.UPDATE,
      data
    );
    await sequelizeInstance.transaction(async (t) => {
      await CategoryPemeriksaanRepository.update(uuid, validData, t);
    });
  }

  static async delete(uuid) {
    const isCategoryPemeriksaanExist =
      await CategoryPemeriksaanRepository.findByUuid(uuid);

    if (!isCategoryPemeriksaanExist) {
      throw new NotfoundException("Category Pemeriksaan tidak ada");
    }

    sequelizeInstance.transaction(async (t) => {
      await CategoryPemeriksaanRepository.delete(uuid, t);
    });
  }

  static async show(uuid) {
    const categoryPemeriksaan = await CategoryPemeriksaanRepository.findByUuid(
      uuid
    );

    if (!categoryPemeriksaan) {
      throw new NotfoundException("Category Pemeriksaan tidak ada");
    }

    return categoryPemeriksaan;
  }

  static async findByCode(code) {
    const categoryPemeriksaan = await CategoryPemeriksaanRepository.findByCode(
      code
    );
    return categoryPemeriksaan;
  }

  static async findAll(req) {
    const categoryPemeriksaan = await CategoryPemeriksaanRepository.findAll(
      req
    );
    return categoryPemeriksaan;
  }

  static async findAllActive(req) {
    const categoryPemeriksaan =
      await CategoryPemeriksaanRepository.findAllActive(req);
    return categoryPemeriksaan;
  }

  static async import(filePath, faskes_uuid) {
    const data = [];
    const noUrutList = [];

    const workSheet = await extractExcel(filePath);

    workSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const noUrut = row.values[4];
      data.push({
        code: row.values[2],
        name: row.values[3],
        no_urut: noUrut,
        status: true,
        faskes_uuid: faskes_uuid,
      });
      noUrutList.push(noUrut);
    });

    checkDuplicate(data);

    data.map((item) => {
      ZodValidator.validate(CategoryPemeriksaanValidation.CREATE, item);
    });

    // Cek duplikat no_urut dengan yang sudah ada di database
    const existingNoUrut = await CategoryPemeriksaanRepository.findAllNoUrut(
      noUrutList
    );
    if (existingNoUrut.length > 0) {
      throw new ConflictException(
        `Nomor urut berikut sudah digunakan: ${existingNoUrut.join(", ")}`
      );
    }

    await sequelizeInstance.transaction(async (t) => {
      await CategoryPemeriksaanRepository.bulkCreate(data, t);
    });
  }
}
