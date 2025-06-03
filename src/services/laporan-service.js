import OrderLabRepository from "../repositories/order-lab-repository.js";
import Laporanvalidation from "../validations/laporan-validation.js";
import ZodValidator from "../validations/zod-validator.js";
import ObservationItemRepository from "../repositories/observation-item-repository.js";
import convertSecodToTime from "../helpers/time-converter.js";
import OrderLabPemeriksaanRepository from "../repositories/order-lab-pemeriksaan-repository.js";
import { formatPemeriksaanPerTanggal } from "../helpers/format-rekap-pemeriksaan.js";
import { formatPemeriksaan } from "../helpers/format-rekap-pemeriksaan.js";

export default class LaporanService {
  static async getKunjungan(req) {
    const validdata = ZodValidator.validate(
      Laporanvalidation.GET_KUNJUNGAN,
      req
    );

    const laporan = await OrderLabRepository.findAllSelesai(validdata);
    // return laporan;

    const plainData = laporan.data.map((item) => item.get({ plain: true }));

    const laporanWithGrandTotalLab = plainData.map((item) => {
      let grandTotalLab;

      if (item.is_mcu) {
        item.order_lab_pemeriksaan.map((i) => {
          i.tarif_lab.grand_total = 0;
        });
      }
      grandTotalLab = item.order_lab_pemeriksaan.reduce(
        (acc, curr) => acc + curr.tarif_lab.grand_total,
        0
      );

      return {
        ...item,
        grand_total_lab: grandTotalLab,
      };
    });

    const payload = {
      data: laporanWithGrandTotalLab,
      pagination: laporan.pagination,
    };

    return payload;
  }

  static async getTat(req) {
    const validdata = ZodValidator.validate(
      Laporanvalidation.GET_KUNJUNGAN,
      req
    );

    const laporan = await OrderLabRepository.findAllSelesai(validdata);
    const plainData = laporan.data.map((item) => item.get({ plain: true }));

    const laporanWithTat = plainData.map((item) => {
      const tat = parseInt(item.waktu_selsai) - parseInt(item.waktu_validasi);
      const tatFormated = convertSecodToTime(tat);
      return {
        ...item,
        tat: tatFormated,
      };
    });

    const payload = {
      data: laporanWithTat,
      pagination: laporan.pagination,
    };

    return payload;
  }

  static async getRekapPemeriksaanPerTanggal(req) {
    const validData = ZodValidator.validate(
      Laporanvalidation.GET_REKAP_KUNJUNGAN,
      req
    );

    const result = await OrderLabPemeriksaanRepository.findRekapPemeriksaan(
      validData
    );

    const dataRekap = formatPemeriksaanPerTanggal(result.data);

    const payload = {
      data: dataRekap,
      pagination: result.pagination,
    };

    return payload;
  }

  static async getRekapPemeriksaan(req) {
    const validData = ZodValidator.validate(
      Laporanvalidation.GET_REKAP_KUNJUNGAN,
      req
    );

    const result = await OrderLabPemeriksaanRepository.findRekapPemeriksaan(
      validData
    );

    const dataRekap = formatPemeriksaan(result.data);

    const payload = {
      data: dataRekap,
      pagination: result.pagination,
    };

    return payload;
  }
}
