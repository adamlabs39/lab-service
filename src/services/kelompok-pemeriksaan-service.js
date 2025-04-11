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
import checkDuplicate from "../helpers/check-duplicate.js";
import { status } from "./order-lab-service.js";
import extractExcel from "../helpers/extract-excel.js";
import { boolean } from "zod";
import pagination from "../helpers/pagination.js";

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

       await sequelizeInstance.transaction(async (t) => {
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
        const formatedKelompokPemeriksaan = kelompokPemerikasan.data.map(kelompokPemeriksaan => {
            return {
                id: kelompokPemeriksaan.id,
                name: kelompokPemeriksaan.name,
                code: kelompokPemeriksaan.code,
                uuid: kelompokPemeriksaan.uuid,
                category_pemeriksaan_uuid: kelompokPemeriksaan.category_pemeriksaan_uuid,
                category_pemeriksaan: kelompokPemeriksaan.category_pemeriksaan.name,
                status: kelompokPemeriksaan.status,
                item_pemeriksaan: kelompokPemeriksaan.item_kelompok_pemeriksaan.map(item => {
                    return {
                        id : item.item_pemeriksaan.id,
                        name: item.item_pemeriksaan.name,
                        uuid: item.item_pemeriksaan.uuid,
                        status: item.item_pemeriksaan.status,
                    }
                }  
                )
            };
        });

        kelompokPemerikasan.data = formatedKelompokPemeriksaan;
        kelompokPemerikasan.pagination = kelompokPemerikasan.pagination
        

        return kelompokPemerikasan;
    }

    static async import(path, faskes_uuid){
        const data = []

        const workSheet = await extractExcel(path)

        workSheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            data.push({
                code: row.values[2],
                name: row.values[3],
                category_pemeriksaan: row.values[4],
                loinc: row.values[7],
                icd9: row.values[6],
                snomed: row.values[5],
                item_pemeriksaans: row.values[8] ? String(row.values[8]).split(",").map(item => item.trim()) : [],
                faskes_uuid: faskes_uuid,
                status: true
            });
        });

        // return data
        
        // Mengambil semua kode yang diperlukan
        const allItemPmeriksaansCodes = data.map(item => item.item_pemeriksaans).flat();
        const snomedNames = data.map(item => item.snomed).filter(Boolean);
        const icd9Names = data.map(item => item.icd9).filter(Boolean);
        const loincNames = data.map(item => item.loinc).filter(Boolean);
        const categoryPemeriksaanCodes = data.map(item => item.category_pemeriksaan).filter(Boolean);
        
        // Mengambil semua data terkait secara bersamaan
        const [loincList, snomedList, icd9List, categoryPemeriksaanList, itemPemeriksaanList] = await Promise.all([
            LoincRepository.findByNameIn(loincNames),
            SnomedRepository.findByNameIn(snomedNames),
            Icd9Repository.findByNameIn(icd9Names),
            CategoryPemeriksaanRepository.findByCodeIn(categoryPemeriksaanCodes, faskes_uuid),
            ItemPemeriksaanRepository.findByCodeIn(allItemPmeriksaansCodes, faskes_uuid)
        ]);

        
        // Memperbarui data dengan UUID yang sesuai
        data.forEach((item, index) => {
            // Cek dan update LOINC
            if (item.loinc) {
                const loinc = loincList.find(loinc => loinc.name === item.loinc);
                if (loinc) {
                    data[index].loinc_uuid = loinc.uuid;
                    delete data[index].loinc;
                } else {
                    throw new NotfoundException(`Loinc '${item.loinc}' tidak ditemukan`);
                }
            }
            
            // Cek dan update SNOMED
            if (item.snomed) {
                const snomed = snomedList.find(snomed => snomed.name === item.snomed);
                if (snomed) {
                    data[index].snomed_uuid = snomed.uuid;
                    delete data[index].snomed;
                } else {
                    throw new NotfoundException(`Snomed '${item.snomed}' tidak ditemukan`);
                }
            }
            
            // Cek dan update ICD9
            if (item.icd9) {
                const icd9 = icd9List.find(icd9 => icd9.name === item.icd9);
                if (icd9) {
                    data[index].icd9_uuid = icd9.uuid;
                    delete data[index].icd9;
                } else {
                    throw new NotfoundException(`ICD9 '${item.icd9}' tidak ditemukan`);
                }
            }
            
            // Cek dan update Category Pemeriksaan
            if (item.category_pemeriksaan) {
                const categoryPemeriksaan = categoryPemeriksaanList.find(category => category.code === item.category_pemeriksaan);
                if (categoryPemeriksaan) {
                    data[index].category_pemeriksaan_uuid = categoryPemeriksaan.uuid;
                    delete data[index].category_pemeriksaan;
                } else {
                    throw new NotfoundException(`Category Pemeriksaan '${item.category_pemeriksaan}' tidak ditemukan`);
                }
            }
            
            // Cek dan update Item Pemeriksaans
            if (item.item_pemeriksaans.length > 0) {
                const itemUuids = item.item_pemeriksaans.map(code => {
                    const foundItem = itemPemeriksaanList.find(ip => ip.code === code);
                    if (!foundItem) {
                        throw new NotfoundException(`Item Pemeriksaan '${code}' tidak ditemukan`);
                    }
                    return foundItem.uuid;
                });
                data[index].item_pemeriksaans = itemUuids;
            }
        });
        
        // return data

        data.map((item) => {
            ZodValidator.validate(KelompokPemeriksaanValidation.CREATE, item)
        })

         await sequelizeInstance.transaction(async (t) => {
            const kelompokPemeriksaanData = data.map(item => {
                return{
                    code: item.code,
                    name: item.name,
                    loinc_uuid: item.loinc_uuid,
                    icd9_uuid: item.icd9_uuid,
                    snomedct_uuid: item.snomed_uuid,
                    category_pemeriksaan_uuid: item.category_pemeriksaan_uuid,
                    faskes_uuid: item.faskes_uuid,
                    status: item.status
                }
            })
            const kelompokPemeriksaans = await KelompokPemeriksaanRepository.bulkCreate(kelompokPemeriksaanData, t);
    

            const itemKelompokPemeriksaans = [];
            
            kelompokPemeriksaans.map((kelompok, index) => {
                const itemUuids = data[index].item_pemeriksaans;
                itemUuids.map((itemUuid) => {
                    itemKelompokPemeriksaans.push({
                        kelompok_pemeriksaan_uuid: kelompok.uuid,
                        item_pemeriksaan_uuid: itemUuid
                    });
                });
            });
        
            
            await ItemKelompokPemeriksaanRepository.bulkCreate(itemKelompokPemeriksaans, t);
        });
        
        
    }
}

