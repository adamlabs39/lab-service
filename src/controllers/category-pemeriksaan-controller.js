import { UniqueConstraintError } from "sequelize";
import deletefile from "../helpers/file.js";
import validateExcel from "../helpers/validator-excel.js";
import successResponse from "../response/success-response.js";
import CategoryPemeriksaanService from "../services/category-pemeriksaan-service.js";
import errorResponse from "../response/error-response.js";

export default class CategoryPemeriksaanController {
  static async create(request, response, next) {
    try {
      const data = request.body;
      data.faskes_uuid = request.author.faskesUuid;
      await CategoryPemeriksaanService.create(data);
      return response
        .status(201)
        .json(successResponse("Data berhasil disimpan"));
    } catch (error) {
      next(error);
    }
  }

  static async update(request, response, next) {
    try {
      const data = request.body;
      const uuid = request.params.uuid;
      data.faskes_uuid = request.author.faskesUuid;
      await CategoryPemeriksaanService.update(uuid, data);

      response.status(200).json(successResponse("Data berhasil diedit"));
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return response.status(409).json(errorResponse("Kode sudah ada"));
      }
      next(error);
    }
  }

  static async delete(request, response, next) {
    try {
      const uuid = request.params.uuid;
      await CategoryPemeriksaanService.delete(uuid);
      response.status(200).json(successResponse("Data berhasil dihapus"));
    } catch (error) {
      next(error);
    }
  }

  static async show(request, response, next) {
    try {
      const uuid = request.params.uuid;
      const categoryPemeriksaan = await CategoryPemeriksaanService.show(uuid);
      response
        .status(200)
        .json(
          successResponse("Category Pemeriksaan detail", categoryPemeriksaan)
        );
    } catch (error) {
      next(error);
    }
  }

  static async findAll(request, response, next) {
    try {
      request.body.faskes_uuid = request.author.faskesUuid;
      request.body.name = request.query.name;
      request.body.page = request.query.page;
      request.body.limit = request.query.limit;

      const categoryPemeriksaan = await CategoryPemeriksaanService.findAll(
        request.body
      );
      response
        .status(200)
        .json(
          successResponse("Data berhasil ditampilkan", categoryPemeriksaan)
        );
    } catch (error) {
      next(error);
    }
  }

  static async findAllActive(request, response, next) {
    try {
      request.body.faskes_uuid = request.author.faskesUuid;

      const categoryPemeriksaan =
        await CategoryPemeriksaanService.findAllActive(request.body);
      response
        .status(200)
        .json(
          successResponse("Data berhasil ditampilkan", categoryPemeriksaan)
        );
    } catch (error) {
      next(error);
    }
  }

  static async import(request, response, next) {
    try {
      validateExcel(request.file);

      await CategoryPemeriksaanService.import(
        request.file.path,
        request.author.faskesUuid
      );

      deletefile(request.file.path);

      response.status(201).json(successResponse("Data berhasil disimpan"));
    } catch (error) {
      next(error);
    }
  }
}
