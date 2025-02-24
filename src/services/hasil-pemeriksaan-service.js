import sequelizeInstance from "@adameds/model-sdk/instance";
import flagDecider from "../helpers/flag-decider.js";
import ObservationItemRepository from "../repositories/observation-item-repository.js";
import OrderLabRepository from "../repositories/order-lab-repository.js";
import PatientRepository from "../repositories/patient-repository.js";
import HasilPemeriksaanValidation from "../validations/hasil-pemeriksaan-validation.js";
import ZodValidator from "../validations/zod-validator.js";
import ExpertiseValidation from "../validations/expertise-validation.js";
import toEpochDate from "../helpers/date-helper.js";

export default class HasilPemeriksaanService {
  static async inputHasilPemeriksaan(req) {
    console.log(req);
    const validdata = ZodValidator.validate(
      HasilPemeriksaanValidation.INPUT_HASIL_PEMERIKSAAN,
      req
    );

    const orderLabExist = await OrderLabRepository.findByUuid(
      validdata.order_lab_uuid,
      validdata.faskes_uuid
    );

    if (!orderLabExist) {
      throw new NotfoundException("Order Lab tidak ada");
    }

    const observationItemUuids = validdata.hasil_pemeriksaan.map(
      (item) => item.observation_item_uuid
    );

    const observationItems = await ObservationItemRepository.findByUuids(
      observationItemUuids,
      validdata.faskes_uuid
    );

    if (observationItems.length !== observationItemUuids.length) {
      throw new NotfoundException("Observation Item tidak ada");
    }

    const patient = await PatientRepository.findByUuid(
      orderLabExist.patient_uuid,
      validdata.faskes_uuid
    );

    const hasilPemeriksaan = validdata.hasil_pemeriksaan.map((item, i) => {
      return {
        observation_item_uuid: item.observation_item_uuid,
        item_pemeriksaan_uuid: observationItems[i].item_pemeriksaan_uuid,
        result: item.result,
        jenis_input: observationItems[i].item_pemeriksaan.jenis_input,
      };
    });

    const patientData = {
      gender: patient.gender,
      ageYear: patient.birth_detail.ageYear,
      ageMonth: patient.birth_detail.ageMonth,
      ageDay: patient.birth_detail.ageDay,
    };

    const flags = await flagDecider(
      hasilPemeriksaan,
      patientData,
      validdata.faskes_uuid
    );

    await sequelizeInstance.transaction(async (t) => {
      for (const flag of flags) {
        const data = flag
        flag.waltu_periksan =  toEpochDate(new Date())
        flag.status_periksa = true

        await ObservationItemRepository.updateResult(
          flag.observation_item_uuid,
          validdata.faskes_uuid,
          flag,
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
            expertise : true,
        },
        t
      );
    });
  }

  static async getPemeriksaan(req, order_lab_uuid){
    const orderLabExist = await OrderLabRepository.findByUuid(
      order_lab_uuid,
      req.faskes_uuid
    );

    if (!orderLabExist) {
      throw new NotfoundException("Order Lab tidak ada");
    }

    const hasilPemeriksaan = await ObservationItemRepository.findByOrderLabUuid(
      order_lab_uuid,
      req.faskes_uuid
    );

    return hasilPemeriksaan
  } 
}
