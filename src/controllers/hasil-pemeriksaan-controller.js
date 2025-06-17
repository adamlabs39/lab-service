import successResponse from "../response/success-response.js";
import HasilPemeriksaanService from "../services/hasil-pemeriksaan-service.js";

export default class HasilPemeriksaanController {
  static async inputHasilPemeriksaan(req, res, next) {
    try {
      const data = req.body;
      data.faskes_uuid = req.author.faskesUuid;
      await HasilPemeriksaanService.inputHasilPemeriksaan(data);
      res.status(201).json(successResponse("Data berhasil disimpan"));
    } catch (error) {
      next(error);
    }
  }

  static async expertise(req, res, next) {
    try {
      const data = req.body;
      data.faskes_uuid = req.author.faskesUuid;
      data.order_lab_uuid = req.params.uuid;
      const result = await HasilPemeriksaanService.expertise(data);
      res.status(200).json(successResponse("Expertise success", result));
    } catch (error) {
      next(error);
    }
  }

  static async batalExpertise(req, res, next) {
    try {
      const data = req.body;
      data.order_lab_uuid = req.params.uuid;
      data.faskes_uuid = req.author.faskesUuid;

      const result = await HasilPemeriksaanService.batalExpertise(data);
      res.status(200).json(successResponse("Batal expertise success", result));
    } catch (error) {
      next(error);
    }
  }

  static async getHasilPemeriksaan(req, res, next) {
    try {
      const data = req.body;
      data.faskes_uuid = req.author.faskesUuid;
      const order_lab_uuid = req.params.uuid;
      const result = await HasilPemeriksaanService.getPemeriksaan(
        data,
        order_lab_uuid
      );
      res
        .status(200)
        .json(successResponse("Data berhasil ditampilkan", result));
    } catch (error) {
      next(error);
    }
  }
}
