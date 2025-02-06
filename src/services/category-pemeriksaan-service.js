import sequelizeInstance from "@adameds/model-sdk/instance";
import ConflictException from "../exception/conflict-exception.js";
import NotfoundException from "../exception/notfound-exception.js";
import CategoryPemeriksaanRepository from "../repositories/category-pemeriksaan-repository.js";
import CategoryPemeriksaanValidation from "../validations/category-pemeriksaan-validation.js";
import ZodValidator from "../validations/zod-validator.js";

export default class CategoryPemeriksaanService {
  static async create(req) {
    const validData = ZodValidator.validate(
      CategoryPemeriksaanValidation.CREATE,
      req
    );

    const isCategoryPemeriksaanExist =
      await CategoryPemeriksaanRepository.findByCode(validData.code, validData.faskes_uuid);

    if (isCategoryPemeriksaanExist) {
      throw new ConflictException("Category Pemeriksaan dengan code tersebut telah digunakan");
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

    const validData = ZodValidator.validate(
      CategoryPemeriksaanValidation.UPDATE,
      data
    );
   sequelizeInstance.transaction(async (t) => {
      await CategoryPemeriksaanRepository.update(uuid, validData, t);
   })
  }

  static async delete(uuid) {

    const isCategoryPemeriksaanExist = await CategoryPemeriksaanRepository.findByUuid(uuid);

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
    const categoryPemeriksaan = await CategoryPemeriksaanRepository.findAll(req);
    return categoryPemeriksaan;
  }
}
