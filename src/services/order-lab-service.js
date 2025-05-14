import OrderLabValidation from "../validations/order-lab-validation.js";
import ZodValidator from "../validations/zod-validator.js";
import PenjaminRepository from "../repositories/penjamin-repository.js";
import PractitionerRepository from "../repositories/practitioner-repository.js";
import LokasiRepository from "../repositories/lokasi-repository.js";
import TarifLabRepository from "../repositories/tarif-lab-repository.js";
import toEpochDate from "../helpers/date-helper.js";
import OrderLabRepository from "../repositories/order-lab-repository.js";
import PatientRepository from "../repositories/patient-repository.js";
import NotfoundException from "../exception/notfound-exception.js";
import sequelizeInstance from "@adameds/model-sdk/instance";
import OrderLabPemeriksaanRepository from "../repositories/order-lab-pemeriksaan-repository.js";
import generateregistrationNumber from "../helpers/generate-registration-number.js";
import generateCode from "../helpers/generate-code.js";
import AddressRepository from "../repositories/address-repository.js";
import BirthDetailRepository from "../repositories/birth-detail-repository.js";
import ConflictException from "../exception/conflict-exception.js";
import ObservationItemRepository from "../repositories/observation-item-repository.js";
import SpesimenRepository from "../repositories/spesimen-repository.js";

export const status = {
   CANCEL: 0,
   REQUEST : 1,
   PERIKSA : 2,
   SELESAI : 3
}

export default class OrderLabService {

    static async create(req){

        const validata = ZodValidator.validate(OrderLabValidation.CREATE, req);

        if(validata.patient_uuid){
            const isPatientExist = await PatientRepository.findByUuid(validata.patient_uuid, validata.faskes_uuid);
            if(!isPatientExist){
                throw new NotfoundException("Pasien tidak ada");
            }
        }else{
            const isPatientExist = await PatientRepository.findByNoRm(validata.patient.no_rm, validata.faskes_uuid);

            if(isPatientExist){
                throw new ConflictException("Pasien sudah ada dengan no rm yang sama");
            }
        }

        
        if(validata.penjamin_uuid ){
            const isAsuransiExist = await PenjaminRepository.findByUuid(validata.penjamin_uuid, validata.faskes_uuid);
            
            if(!isAsuransiExist){
                throw new NotfoundException("Penjamin tidak ada");
            }
        }
        
        if(validata.dokter_pengirim_uuid){
            const isDokterExist = await PractitionerRepository.findbyUuid(validata.dokter_pengirim_uuid, validata.faskes_uuid);
            if(!isDokterExist){
                throw new NotfoundException("Dokter tidak ada");
            }
        }
        
        const isLokasiExist = await LokasiRepository.findByUuid(validata.lokasi_uuid, validata.faskes_uuid);
        
        if(!isLokasiExist){
            throw new NotfoundException("Lokasi tidak ada");
        }
        
        const tarifs = await TarifLabRepository.findByUuids(validata.tarif_lab_uuids);
        if(tarifs.length !== validata.tarif_lab_uuids.length){
            throw new NotfoundException("Tarif lab tidak ada");
        }

        const itemPemeriksaanUuids = []


        tarifs.forEach(tarif => {
            tarif.tarif_lab_item.forEach(item => {
                if(item.item_pemeriksaan_uuid){
                    itemPemeriksaanUuids.push(item.item_pemeriksaan.uuid)
                }

                if(item.kelompok_pemeriksaan_uuid){
                    item.kelompok_pemeriksaan.item_kelompok_pemeriksaan.forEach(item_kelompok => {
                        itemPemeriksaanUuids.push(item_kelompok.item_pemeriksaan.uuid)
                    })
                }
            })
        })

        const duplicates = itemPemeriksaanUuids.filter((uuid, index, self) => 
            uuid !== null && self.indexOf(uuid) !== index
        );
        
        if(duplicates.length > 0){
            throw new NotfoundException("Item pemeriksaan tidak boleh duplikat");
        }

         await sequelizeInstance.transaction(async (t) => {
            let newPatient ;
           if(validata.patient){
            const {patient} = validata

            const address = await AddressRepository.create({
                fullAddress : validata.full_address,
                prov : patient.prov,
                city : patient.city,
                district : patient.district,
                rt : patient.rt,
                rw : patient.rw,
                village : patient.village,
                postalCode : patient.postal_code,
                country : patient.country,
                faskesUuid : validata.faskes_uuid
            }, t);

            const birthDetail = await BirthDetailRepository.create({
                birthPlace : patient.birth_place,
                birthDate : patient.birth_date,
                ageYear : patient.age_year,
                ageMonth : patient.age_month,
                ageDay : patient.age_day,
                faskesUuid : validata.faskes_uuid
            },t)

            newPatient = await PatientRepository.create({
                noRm : patient.no_rm,
                title : patient.title,
                name : patient.name,
                identity : patient.identity,
                noIdentity : patient.no_identity,
                birthDetailUuid : birthDetail.uuid,
                sauSehatUuid : validata.satu_sehat_uuid,
                gender : patient.gender,
                phone : patient.phone,
                religion : patient.religion,
                addressUuid : address.uuid,
                language : patient.language,
                motherName : patient.mother_name, 
                maritalStatus : patient.marital_status,
                faskesUuid : validata.faskes_uuid
            })
           }

            const noReg = await generateregistrationNumber("REG");
            const noOrder = generateCode("LPK");

            const orderLabData = {
                ...validata,
                noreg: noReg,
                no_order: noOrder,
                faskes_uuid: validata.faskes_uuid,
                order_status: 1,
                tgl_order: toEpochDate(new Date()), 
                patient_uuid: validata.patient_uuid ? validata.patient_uuid : newPatient.uuid,
            }
    
            const order = await OrderLabRepository.create(orderLabData);

            const orderItemsData = validata.tarif_lab_uuids.map(tarif_uuid =>
                {
                   return {
                        order_lab_uuid: order.uuid,
                        tarif_lab_uuid: tarif_uuid,
                        faskes_uuid: validata.faskes_uuid,
                   }
                }
             )

            await OrderLabPemeriksaanRepository.bulkCreate(orderItemsData, t);
            
             const observationItemdata = itemPemeriksaanUuids.map(item_pemeriksaan_uuid => {
                return {
                    order_lab_uuid: order.uuid,
                    item_pemeriksaan_uuid: item_pemeriksaan_uuid,
                    faskes_uuid: validata.faskes_uuid,
                    status_periksa : false,
                    waktu_periksa : toEpochDate(new Date())
                }
             })

            await ObservationItemRepository.bulkCreate(observationItemdata, t);
        })
        
    }

    static async findOne(uuid, faskes_uuid){
        const order = await OrderLabRepository.findByUuid(uuid, faskes_uuid);

        if(!order){
            throw new NotfoundException("Order tidak ada");
        }

        return order;
    }

    static async findAll(req){
        return await OrderLabRepository.findAll(req);
    }

    static async update(uuid, req){
        const validata = ZodValidator.validate(OrderLabValidation.UPDATE, req);
        const order = await OrderLabRepository.findByUuid(uuid, validata.faskes_uuid);

        if(!order){
            throw new NotfoundException("Order tidak ada");
        }

       await sequelizeInstance.transaction(async (t) => {
        await OrderLabRepository.update(uuid,req.faskes_uuid ,{
            cito : req.cito,
            tgl_pemeriksaan : req.tgl_pemeriksaan,
            status_puasa : req.status_puasa,
        }, t);

        if(validata.tarif_lab_uuids){
            const tarifs = await TarifLabRepository.findByUuids(validata.tarif_lab_uuids);

            if(tarifs.length !== validata.tarif_lab_uuids.length){
                throw new NotfoundException("Tarif lab tidak ada");
            }

            const itemPemeriksaanUuids = []

            tarifs.forEach(tarif => {
                tarif.tarif_lab_item.forEach(item => {
                    if(item.item_pemeriksaan_uuid){
                        itemPemeriksaanUuids.push(item.item_pemeriksaan.uuid)
                    }
    
                    if(item.kelompok_pemeriksaan_uuid){
                        item.kelompok_pemeriksaan.item_kelompok_pemeriksaan.forEach(item_kelompok => {
                            itemPemeriksaanUuids.push(item_kelompok.item_pemeriksaan.uuid)
                        })
                    }
                })
            })
    
            const duplicates = itemPemeriksaanUuids.filter((uuid, index, self) => 
                uuid !== null && self.indexOf(uuid) !== index
            );
            
            if(duplicates.length > 0){
                throw new NotfoundException("Item pemeriksaan tidak boleh duplikat");
            }

            await OrderLabPemeriksaanRepository.deleteByOrderLab(uuid, validata.faskes_uuid, t);

            const orderItemsData = validata.tarif_lab_uuids.map(tarif_uuid =>
                {
                   return {
                        order_lab_uuid: order.uuid,
                        tarif_lab_uuid: tarif_uuid,
                        faskes_uuid: validata.faskes_uuid
                   }
                }
             )

            await OrderLabPemeriksaanRepository.bulkCreate(orderItemsData, t);
        }
       })
    }

    static async updateBatalOrder(req){
        // console.log(req)
        const validata = ZodValidator.validate(OrderLabValidation.BATAL_ORDER, req);
        const orders = await OrderLabRepository.findByUuids(validata.order_lab_uuids, validata.faskes_uuid);

        if(orders.length !== validata.order_lab_uuids.length){
            throw new NotfoundException("Order tidak ada");
        }

        if(orders.status === 3){
            throw new ConflictException("Order sudah selesai tidak bisa dibatalkan");
        }

        await sequelizeInstance.transaction(async (t) => {
            await OrderLabRepository.updateBatalOrder(validata.order_lab_uuids, {
                alasan_batal_order : req.alasan_batal_order,
                faskes_uuid : validata.faskes_uuid
            }, t);
        })
    }

    static async selesaiPeriksa(uuid, faskes_uuid){

        const order = await OrderLabRepository.findByUuid(uuid, faskes_uuid);
        if(!order){
            throw new NotfoundException("Order tidak ada");
        }
        console.log(order.order_status)
        console.log(status.PERIKSA)
        if(order.order_status !== status.PERIKSA){
            throw new ConflictException("Order tidak dalam status pemeriksaan");
        }
        
        const itemPemeriksaan = await ObservationItemRepository.findByOrderLabUuid(uuid, faskes_uuid);
        
        const itemPeriksaSeleesai = await ObservationItemRepository.findByOrderLabUuidAndStatusSudahPeriksa(uuid, faskes_uuid);
        
        if(itemPemeriksaan.length !== itemPeriksaSeleesai.length){
            throw new ConflictException("Item pemeriksaan belum selesai");
        }
        
        await OrderLabRepository.update(uuid, faskes_uuid, {
            order_status : status.SELESAI,
            waktu_selsai : toEpochDate(new Date())
        })
    }

    static async validasi(uuid, req){
        console.log(req)
        const validata = ZodValidator.validate(OrderLabValidation.VALIDASI, req);
        const order = await OrderLabRepository.findByUuid(uuid, validata.faskes_uuid);

        if(!order){
            throw new NotfoundException("Order tidak ada");
        }

        if(order.order_status != 1){
            throw new ConflictException("Order sudah divalidasi dan sudah selesai tidak bisa divalidasi");
        }

        const isDokterExist = await PractitionerRepository.findByUuidDokter(validata.practitioner_uuid, validata.faskes_uuid);

        if(!isDokterExist){
            throw new NotfoundException("Dokter tidak ada");
        }

        if(validata.spesimen_uuids){
            const spesimens = await SpesimenRepository.findByUuids(validata.spesimen_uuids);

            if(spesimens.length !== validata.spesimen_uuids.length){
                throw new NotfoundException("Spesimen tidak ada");
            }
        }

        await sequelizeInstance.transaction(async (t) => {
            await OrderLabRepository.update(uuid, validata.faskes_uuid, {
                spesimen_uuids : validata.spesimen_uuids,
                practitioner_uuid : validata.practitioner_uuid,
                order_status : status.PERIKSA,
                waktu_validasi : toEpochDate(new Date())
            }, t);
        })
    }   

    static async batalValidasi(req){
        const validata = ZodValidator.validate(OrderLabValidation.BATAL_VALIDASI, req);
        const orders = await OrderLabRepository.findByUuids(validata.order_lab_uuids, validata.faskes_uuid);

        if(orders.length !== validata.order_lab_uuids.length){
            throw new NotfoundException("Order tidak ada");
        }

        orders.map(order => {
            if(order.order_status !== 2){
                throw new ConflictException("Hanya order dengan status periksa yang bisa dibatal validasi");
            }
        })

        await sequelizeInstance.transaction(async (t) => {
            await OrderLabRepository.update(validata.order_lab_uuids, validata.faskes_uuid, {
                order_status : status.REQUEST,
                alasan_batal_validasi : req.alasan_batal_validasi
            }, t);
        })
    }
}