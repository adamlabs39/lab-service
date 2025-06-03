import successResponse from "../response/success-response.js";
import LaporanService from "../services/laporan-service.js";

export default class LaporanController {
  static async getKunjungan(req, res, next) {
    try {
      const data = req.query;
      const safePage = isNaN(parseInt(data.page))
        ? 1
        : Math.max(parseInt(data.page), 1);
      const safeLimit = isNaN(parseInt(data.limit))
        ? 10
        : Math.min(parseInt(data.limit), 100);

      data.faskes_uuid = req.author.faskesUuid;
      data.page = safePage;
      data.limit = safeLimit;

      const laporan = await LaporanService.getKunjungan(data);
      res
        .status(200)
        .json(successResponse("Data Berhasil ditampilkam", laporan));
    } catch (error) {
      next(error);
    }
  }

  static async getTat(req, res, next) {
    try {
      const data = req.query;
      const safePage = isNaN(parseInt(data.page))
        ? 1
        : Math.max(parseInt(data.page), 1);
      const safeLimit = isNaN(parseInt(data.limit))
        ? 10
        : Math.min(parseInt(data.limit), 100);

      data.faskes_uuid = req.author.faskesUuid;
      data.page = safePage;
      data.limit = safeLimit;
      const laporan = await LaporanService.getTat(data);
      res
        .status(200)
        .json(successResponse("Data Berhasil ditampilkan", laporan));
    } catch (error) {
      next(error);
    }
  }

  static async getRekapPemeriksaanPerTanggal(req, res, next) {
    try {
      const data = req.query;
      data.faskes_uuid = req.author.faskesUuid;
      const laporan = await LaporanService.getRekapPemeriksaanPerTanggal(data);
      res
        .status(200)
        .json(successResponse("Data Berhasil ditampilkan", laporan));
    } catch (error) {
      next(error);
    }
  }

  static async getRekapPemeriksaan(req, res, next) {
    try {
      const data = req.query;
      data.faskes_uuid = req.author.faskesUuid;
      const laporan = await LaporanService.getRekapPemeriksaan(data);
      res
        .status(200)
        .json(successResponse("Data Berhasil ditampilkan", laporan));
    } catch (error) {
      next(error);
    }
  }
}
