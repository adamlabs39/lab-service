import sequelizeInstance from "@adameds/model-sdk/instance";
import ConflictException from "../exception/conflict-exception.js";
import NotfoundException from "../exception/notfound-exception.js";
import CategoryPemeriksaanRepository from "../repositories/category-pemeriksaan-repository.js";
import Icd9Repository from "../repositories/icd9-repository.js";
import ItemKelompokPemeriksaanRepository from "../repositories/item-kelompok-pemeriksaan-repository.js";
import ItemPemeriksaanRepository from "../repositories/item-pemeriksaan-repository.js";
import KelompokPemeriksaanRepository from "../repositories/kelompok-pemeriksaan-repository.js";
import LoincRepository from "../repositories/loinc-repository.js";
import SnomedRepository from "../repositories/snomed-repository.js";
import KelompokPemeriksaanValidation from "../validations/kelompok-pemeriksaan-validation.js";
import ZodValidator from "../validations/zod-validator.js";

export default class KelompokPemeriksaanService {
    static async create(req) {
        const validData = ZodValidator.validate(KelompokPemeriksaanValidation.CREATE, req);

        const itemPemeriksaans = await ItemPemeriksaanRepository.findByUuids(validData.item_pemeriksaans);

        if(itemPemeriksaans.length !== validData.item_pemeriksaans.length){
            throw new NotfoundException("Item Pemeriksaan tidak ada");
        }

        const isCategoryPemeriksaanExist = await CategoryPemeriksaanRepository.findByUuid(validData.category_pemeriksaan_uuid);

        if (!isCategoryPemeriksaanExist) {
            throw new NotfoundException("Category Pemeriksaan tidak ada");
        }

        if(validData.snomed_uuid){
            const isSnomedExist = await SnomedRepository.find(validData.snomed_uuid);
            if (!isSnomedExist) {
                throw new NotfoundException("Snomed tidak ada");
            }
        }

        if(validData.icd9_uuid){
            const isIcd9Exist = await Icd9Repository.find(validData.icd9_uuid);
            if (!isIcd9Exist) {
                throw new NotfoundException("Icd9 tidak ada");
            }
        }

        const isLoincExist = await LoincRepository.findByUuid(validData.loinc_uuid);

        if (!isLoincExist) {
            throw new NotfoundException("Loinc tidak ada");
        }

        const isCodeExist = await KelompokPemeriksaanRepository.findByCode(validData.code, validData.faskes_uuid);

        if (isCodeExist) {
            throw new ConflictException("Kelompok Pemeriksaan dengan code tersebut telah digunakan");
        }

        sequelizeInstance.transaction(async (t) => {
            const kelompokPemeriksaan = await KelompokPemeriksaanRepository.create(validData, t);

            const itemKelompokPemeriksaans = validData.item_pemeriksaans.map(item =>{
                return {
                    kelompok_pemeriksaan_uuid: kelompokPemeriksaan.uuid,
                    item_pemeriksaan_uuid: item
                }
            })

            await ItemKelompokPemeriksaanRepository.bulkCreate(itemKelompokPemeriksaans, t);
        })
        
    }

    static async show(uuid) {
        const kelompokPemerikasan = await KelompokPemeriksaanRepository.findByUuid(uuid);

        if (!kelompokPemerikasan) {
            throw new NotfoundException("Kelompok Pemeriksaan tidak ada");
        }

        return {
            id: kelompokPemerikasan.id,
            name: kelompokPemerikasan.name,
            code: kelompokPemerikasan.code,
            uuid: kelompokPemerikasan.uuid,
            category_pemeriksaan_uuid: kelompokPemerikasan.category_pemeriksaan_uuid,
            category_pemeriksaan: kelompokPemerikasan.category_pemeriksaan.name,
            item_pemeriksaan: kelompokPemerikasan.item_kelompok_pemeriksaan.map(item => {
                return {
                    id : item.item_pemeriksaan.id,
                    name: item.item_pemeriksaan.name,
                    uuid: item.item_pemeriksaan.uuid,
                }
            }  
            )
        };
    }

    static async update(uuid, data) {
        const isKelompokPemeriksaanExist = await KelompokPemeriksaanRepository.findByUuid(uuid);

        if (!isKelompokPemeriksaanExist) {
            throw new NotfoundException("Kelompok Pemeriksaan tidak ada");
        }

        const validData = ZodValidator.validate(KelompokPemeriksaanValidation.UPDATE, data);

        const itemPemeriksaans = await ItemPemeriksaanRepository.findByUuids(validData.item_pemeriksaans);

        if(itemPemeriksaans.length !== validData.item_pemeriksaans.length){
            throw new NotfoundException("Item Pemeriksaan tidak ada");
        }

        const isCategoryPemeriksaanExist = await CategoryPemeriksaanRepository.findByUuid(validData.category_pemeriksaan_uuid);

        if (!isCategoryPemeriksaanExist) {
            throw new NotfoundException("Category Pemeriksaan tidak ada");
        }


        if(validData.snomed_uuid){
            const isSnomedExist = await SnomedRepository.find(validData.snomed_uuid);
            if (!isSnomedExist) {
                throw new NotfoundException("Snomed tidak ada");
            }
        }

        if(validData.icd9_uuid){
            const isIcd9Exist = await Icd9Repository.find(validData.icd9_uuid);
            if (!isIcd9Exist) {
                throw new NotfoundException("Icd9 tidak ada");
            }
        }

        const isLoincExist = await LoincRepository.findByUuid(validData.loinc_uuid);

        if (!isLoincExist) {
            throw new NotfoundException("Loinc tidak ada");
        }

        sequelizeInstance.transaction(async (t) => {
            await ItemKelompokPemeriksaanRepository.deleteByKelompokPemeriksaan(uuid, t);

            await KelompokPemeriksaanRepository.update(uuid, validData, t);

            const itemKelompokPemeriksaans = validData.item_pemeriksaans.map(item =>{
                return {
                    kelompok_pemeriksaan_uuid: uuid,
                    item_pemeriksaan_uuid: item
                }
            })

            await ItemKelompokPemeriksaanRepository.bulkCreate(itemKelompokPemeriksaans, t);
        })
    }

    static async delete(uuid) {
        const isKelompokPemeriksaanExist = await KelompokPemeriksaanRepository.findByUuid(uuid);

        if (!isKelompokPemeriksaanExist) {
            throw new NotfoundException("Kelompok Pemeriksaan tidak ada");
        }

        sequelizeInstance.transaction(async (t) => {
            await KelompokPemeriksaanRepository.delete(uuid, t);
            await ItemKelompokPemeriksaanRepository.deleteByKelompokPemeriksaan(uuid, t);
        })
    }

    static async getAll(req) {
        const kelompokPemerikasan = await KelompokPemeriksaanRepository.findAll(req);
        // return kelompokPemerikasan      

        const formatedKelompokPemeriksaan = kelompokPemerikasan.map(kelompokPemeriksaan => {
            return {
                id: kelompokPemeriksaan.id,
                name: kelompokPemeriksaan.name,
                code: kelompokPemeriksaan.code,
                uuid: kelompokPemeriksaan.uuid,
                category_pemeriksaan_uuid: kelompokPemeriksaan.category_pemeriksaan_uuid,
                category_pemeriksaan: kelompokPemeriksaan.category_pemeriksaan.name,
                item_pemeriksaan: kelompokPemeriksaan.item_kelompok_pemeriksaan.map(item => {
                    return {
                        id : item.item_pemeriksaan.id,
                        name: item.item_pemeriksaan.name,
                        uuid: item.item_pemeriksaan.uuid,
                    }
                }  
                )
            };
        });
        

        return formatedKelompokPemeriksaan;
    }
}

