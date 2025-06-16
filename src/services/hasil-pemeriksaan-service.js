import sequelizeInstance from "@adameds/model-sdk/instance";
import flagDecider from "../helpers/flag-decider.js";
import ObservationItemRepository from "../repositories/observation-item-repository.js";
import OrderLabRepository from "../repositories/order-lab-repository.js";
import PatientRepository from "../repositories/patient-repository.js";
import HasilPemeriksaanValidation from "../validations/hasil-pemeriksaan-validation.js";
import ZodValidator from "../validations/zod-validator.js";
import ExpertiseValidation from "../validations/expertise-validation.js";
import toEpochDate from "../helpers/date-helper.js";
import { status } from "./order-lab-service.js";
import { NotfoundException } from "@adameds/model-sdk/exceptions";
import checkNilaiRujukan from "../helpers/check-nilai-rujukan.js";

export default class HasilPemeriksaanService {
  static async inputHasilPemeriksaan(req) {
    // proses validasi
    console.log(req);
    const validdata = ZodValidator.validate(
      HasilPemeriksaanValidation.INPUT_HASIL_PEMERIKSAAN,
      req
    );

    // get data order lab
    const orderLabExist = await OrderLabRepository.findByUuid(
      validdata.order_lab_uuid,
      validdata.faskes_uuid
    );

    if (!orderLabExist) {
      throw new NotfoundException("Order Lab tidak ada");
    }

    if (orderLabExist.order_status !== status.PERIKSA) {
      throw new BadRequestException("Order Lab belum diperiksa");
    }

    // get item pemeriksaan
    const observationItemUuids = validdata.hasil_pemeriksaan.map(
      (item) => item.observation_item_uuid
    );

    // Cari observation items berdasarkan UUID
    const observationItems = await ObservationItemRepository.findByUuids(
      observationItemUuids,
      validdata.faskes_uuid
    );

    if (observationItems.length !== observationItemUuids.length) {
      throw new NotfoundException("Observation Item tidak ditemukan");
    }

    // get pasien
    const patient = await PatientRepository.findByUuid(
      orderLabExist.patient_uuid,
      validdata.faskes_uuid
    );

    // Mapping hasil pemeriksaan dengan data yang valid
    const hasilPemeriksaan = validdata.hasil_pemeriksaan.map((item, index) => {
      const observationItem = observationItems.find(
        (oi) => oi.uuid === item.observation_item_uuid
      );

      if (!observationItem) {
        throw new Error(
          `Observation Item dengan UUID ${item.observation_item_uuid} tidak ditemukan`
        );
      }

      return {
        observation_item_uuid: item.observation_item_uuid,
        item_pemeriksaan_uuid: observationItem.item_pemeriksaan_uuid,
        result: item.result,
        jenis_input: observationItem.item_pemeriksaan.jenis_input,
        status_nilai_rujukan:
          observationItem.item_pemeriksaan.status_nilai_rujukan,
      };
    });

    const pemeriksaanMustCheckingFlag = hasilPemeriksaan.filter(
      (item) => item.status_nilai_rujukan
    );

    const patientData = {
      gender: patient.gender,
      ageYear: patient.birth_detail.ageYear,
      ageMonth: patient.birth_detail.ageMonth,
      ageDay: patient.birth_detail.ageDay,
    };

    const flags = await flagDecider(
      pemeriksaanMustCheckingFlag,
      patientData,
      validdata.faskes_uuid
    );

    console.log("decide flags ==> ", JSON.stringify(flags));

    const mergedDataHasilPemeriksaan = hasilPemeriksaan.map((item) => {
      // Cari item yang sesuai di flagDecider berdasarkan observation_item_uuid
      const flagItem = flags.find(
        (flag) => flag.observation_item_uuid === item.observation_item_uuid
      );

      // Jika ditemukan, gabungkan datanya, jika tidak set flag menjadi null
      return {
        observation_item_uuid: item.observation_item_uuid,
        item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
        result: item.result,
        flag: flagItem ? flagItem.flag : null,
      };
    });

    await sequelizeInstance.transaction(async (t) => {
      if (validdata.catatan_analis) {
        await OrderLabRepository.update(
          validdata.order_lab_uuid,
          validdata.faskes_uuid,
          {
            catatan_analis: validdata.catatan_analis,
          },
          t
        );
      }

      for (const observation of mergedDataHasilPemeriksaan) {
        const data = observation;
        data.waktu_periksa = toEpochDate(new Date());
        data.status_periksa = true;

        await ObservationItemRepository.updateResult(
          data.observation_item_uuid,
          validdata.faskes_uuid,
          data,
          t
        );
      }
    });
  }

  static async expertise(req) {
    const validata = ZodValidator.validate(
      ExpertiseValidation.INPUT_EXPERTISE,
      req
    );

    const orderLabExist = await OrderLabRepository.findByUuid(
      validata.order_lab_uuid,
      validata.faskes_uuid
    );

    if (!orderLabExist) {
      throw new NotfoundException("Order Lab tidak ada");
    }

    await sequelizeInstance.transaction(async (t) => {
      await OrderLabRepository.update(
        validata.order_lab_uuid,
        validata.faskes_uuid,
        {
          catatan_expertise: validata.catatan_expertise,
          expertise: true,
        },
        t
      );
    });
  }

  static async getPemeriksaan(req, order_lab_uuid) {
    const orderLabExist = await OrderLabRepository.findByUuid(
      order_lab_uuid,
      req.faskes_uuid
    );

    if (!orderLabExist) {
      throw new NotfoundException("Order Lab tidak ada");
    }

    const orderData = orderLabExist.get({ plain: true });

    const hasilPemeriksaan = await ObservationItemRepository.findByOrderLabUuid(
      order_lab_uuid,
      req.faskes_uuid
    );

    const checkNilaiRujukanPemeriksaan = await checkNilaiRujukan(
      hasilPemeriksaan,
      orderLabExist.patient,
      req.faskes_uuid
    );

    return { ...orderData, hasil_pemeriksaan: hasilPemeriksaan };
  }
}
