import sequelizeInstance from "@adameds/model-sdk/instance";
import flagDecider from "../helpers/flag-decider.js";
import ObservationItemRepository from "../repositories/observation-item-repository.js";
import OrderLabRepository from "../repositories/order-lab-repository.js";
import PatientRepository from "../repositories/patient-repository.js";
import HasilPemeriksaanValidation from "../validations/hasil-pemeriksaan-validation.js";
import ZodValidator from "../validations/zod-validator.js";

export default class HasilPemeriksaanService{
    static async inputHasilPemeriksaan(req){
        console.log(req)
        const validdata = ZodValidator.validate(HasilPemeriksaanValidation.INPUT_HASIL_PEMERIKSAAN, req);

        const orderLabExist = await OrderLabRepository.findByUuid(validdata.order_lab_uuid, validdata.faskes_uuid);

        if(!orderLabExist){
            throw new NotfoundException("Order Lab tidak ada");
        }

        const observationItemUuids = validdata.hasil_pemeriksaan.map(item => item.observation_item_uuid);

        const observationItems = await ObservationItemRepository.findByUuids(observationItemUuids, validdata.faskes_uuid);

        if(observationItems.length !== observationItemUuids.length){
            throw new NotfoundException("Observation Item tidak ada");
        }

       const patient = await PatientRepository.findByUuid(orderLabExist.patient_uuid, validdata.faskes_uuid);

       const hasilPemeriksaan = validdata.hasil_pemeriksaan.map((item, i) =>{
              return {
                observation_item_uuid: item.observation_item_uuid,
                item_pemeriksaan_uuid: observationItems[i].item_pemeriksaan_uuid,
                result : item.result,
                jenis_input : observationItems[i].item_pemeriksaan.jenis_input,
              }
       })

       const patientData = {
            gender: patient.gender,
            ageYear: patient.birth_detail.ageYear,
            ageMonth: patient.birth_detail.ageMonth,
            ageDay: patient.birth_detail.ageDay,
       }

       const flags = await flagDecider(hasilPemeriksaan, patientData, validdata.faskes_uuid);

       await sequelizeInstance.transaction(async (t) => {
        for(const flag of flags){
            await ObservationItemRepository.updateResult(flag.observation_item_uuid, validdata.faskes_uuid, flag, t);
        }
       })
    }
}