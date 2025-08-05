import { UniqueConstraintError } from "sequelize";
import deletefile from "../helpers/file.js";
import validateExcel from "../helpers/validator-excel.js";
import successResponse from "../response/success-response.js";
import KelompokPemeriksaanService from "../services/kelompok-pemeriksaan-service.js";
import errorResponse from "../response/error-response.js";

export default class KelompokPemeriksaanController {
  static async create(req, res, next) {
    try {
      const data = req.body;
      data.faskes_uuid = req.author.faskesUuid;

      await KelompokPemeriksaanService.create(data);
      return res.status(201).json(successResponse("Data berhasil disimpan"));
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const uuid = req.params.uuid;
      const data = req.body;
      data.faskes_uuid = req.author.faskesUuid;
      await KelompokPemeriksaanService.update(uuid, data);
      return res.status(200).json(successResponse("Data berhasil diubah"));
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return res.status(409).json(errorResponse("Kode sudah ada"));
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const uuid = req.params.uuid;
      await KelompokPemeriksaanService.delete(uuid);
      return res.status(200).json(successResponse("Data berhasil dhapus"));
    } catch (error) {
      next(error);
    }
  }

  static async show(req, res, next) {
    try {
      const uuid = req.params.uuid;
      const result = await KelompokPemeriksaanService.show(uuid);
      return res
        .status(200)
        .json(successResponse("Data berhasil ditampilkan", result));
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req, res, next) {
    try {
      req.body.name = req.query.name;
      req.body.page = req.query.page;
      req.body.limit = req.query.limit;
      req.body.faskes_uuid = req.author.faskesUuid;
      const result = await KelompokPemeriksaanService.getAll(req.body);
      return res
        .status(200)
        .json(successResponse("Data berhasil ditampilkan", result));
    } catch (error) {
      next(error);
    }
  }

  static async findAllActive(req, res, next) {
    try {
      req.body.faskes_uuid = req.author.faskesUuid;
      const result = await KelompokPemeriksaanService.getAllActive(req.body);
      return res
        .status(200)
        .json(successResponse("Data berhasil ditampilkan", result));
    } catch (error) {
      next(error);
    }
  }

  static async import(req, res, next) {
    try {
      validateExcel(req.file);
      await KelompokPemeriksaanService.import(
        req.file.path,
        req.author.faskesUuid
      );
      deletefile(req.file.path);

      return res.status(201).json(successResponse("Data berhasil disimpan"));
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return res.status(409).json(errorResponse("Kode sudah ada"));
      }
      next(error);
    }
  }
}
