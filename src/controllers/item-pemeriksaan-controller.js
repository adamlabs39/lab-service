import deletefile from "../helpers/file.js";
import validateExcel from "../helpers/validator-excel.js";
import successResponse from "../response/success-response.js";
import ItemPemeriksaanService from "../services/item-pemeriksaan-service.js";

export default class ItemPemeriksaanController {
  static async create(req, res, next) {
    try {
      req.body.faskes_uuid = req.author.faskesUuid;
      await ItemPemeriksaanService.create(req.body);
      return res.status(201).json(successResponse("Data berhasil disimpan"));
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      req.body.faskes_uuid = req.author.faskesUuid;
      const uuid = req.params.uuid;
      await ItemPemeriksaanService.update(uuid, req.body);

      res.status(200).json(successResponse("Data berhasil diedit"));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const uuid = req.params.uuid;
      await ItemPemeriksaanService.delete(uuid);
      res.status(200).json(successResponse("Data berhasil dihapus"));
    } catch (error) {
      next(error);
    }
  }

  static async show(req, res, next) {
    try {
      const uuid = req.params.uuid;
      const itemPemeriksaan = await ItemPemeriksaanService.show(uuid);
      res
        .status(200)
        .json(successResponse("Data berhasil ditampilkan", itemPemeriksaan));
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req, res, next) {
    try {
      req.body.faskes_uuid = req.author.faskesUuid;
      const itemPemeriksaan = await ItemPemeriksaanService.findAll(req.body);
      res
        .status(200)
        .json(successResponse("Data berhasil ditampilkan", itemPemeriksaan));
    } catch (error) {
      next(error);
    }
  }

  static async createNilaiRujukan(req, res, next) {
    try {
      req.body.faskes_uuid = req.author.faskesUuid;
      await ItemPemeriksaanService.createNilaiRujukan(req.body);
      return res.status(201).json(successResponse("Data berhasil disimpan"));
    } catch (error) {
      next(error);
    }
  }

  static async findAllNilaiRujukan(req, res, next) {
    try {
      const item_pemeriksaan_uuid = req.params.item_pemeriksaan_uuid;
      const itemPemeriksaan = await ItemPemeriksaanService.findAllNilaiRujukan(
        item_pemeriksaan_uuid
      );
      res
        .status(200)
        .json(successResponse("Data berhasil ditampilkan", itemPemeriksaan));
    } catch (error) {
      next(error);
    }
  }

  static async deleteNilaiRujukan(req, res, next) {
    try {
      const uuid = req.params.uuid;
      await ItemPemeriksaanService.deleteNilaiRujukan(uuid);
      res.status(200).json(successResponse("Data berhasil dihapus"));
    } catch (error) {
      next(error);
    }
  }

  static async updateNilaiRujukan(req, res, next) {
    try {
      const uuid = req.params.uuid;
      req.body.faskes_uuid = req.author.faskesUuid;
      await ItemPemeriksaanService.updateNilaiRujukan(uuid, req.body);
      res.status(200).json(successResponse("Data berhasil diedit"));
    } catch (error) {
      next(error);
    }
  }

  static async showNilaiRujukan(req, res, next) {
    try {
      const uuid = req.params.uuid;
      const itemPemeriksaan = await ItemPemeriksaanService.showNilaiRujukan(
        uuid
      );
      res
        .status(200)
        .json(successResponse("Data berhasil ditampilkan", itemPemeriksaan));
    } catch (error) {
      next(error);
    }
  }

  static async import(req, res, next) {
    try {
      validateExcel(req.file);
      await ItemPemeriksaanService.import(req.file.path, req.author.faskesUuid);
      deletefile(req.file.path);
      res.status(201).json(successResponse("Data berhasil diimport"));
    } catch (error) {
      next(error);
    }
  }
}
