
import ItemPemeriksaanRepository from "../repositories/item-pemeriksaan-repository.js";
import KelompokPemeriksaanRepository from "../repositories/kelompok-pemeriksaan-repository.js";
import TarifKomponenTindakanLabRepository from "../repositories/tarif-komponen-tindakan-lab-repository.js";
import TarifLabRepository from "../repositories/tarif-lab-repository.js";
import ZodValidator from "../validations/zod-validator.js";
import TarifLabPenjaminRepository from "../repositories/tarif-lab-penjamin-repository.js";
import TarifLabPelayananRepository from "../repositories/tarif-lab-pelayanan-repository.js";
import TarifLabItemRepository from "../repositories/tarif-lab-item-repository.js";
import ConflictException from "../exception/conflict-exception.js";
import NotfoundException from "../exception/notfound-exception.js";
import TarifLabValidation from "../validations/tarif-lab-validation.js";
import NameTarifKomponenRepository from "../repositories/name-tarif-komponen-repository.js";
import PenjaminRepository from "../repositories/penjamin-repository.js";

export default class TarifLabService{
    static async create(req){
        const validData = ZodValidator.validate(TarifLabValidation.CREATE, req);
    
        const isCodeExist = await TarifLabRepository.findByCode(validData.code, validData.faskes_uuid);

        if (isCodeExist) {
            throw new ConflictException("Code sudah terdaftarkan");
        }
    
    const penjamins = await PenjaminRepository.findByUuids(validData.penjamin_uuids);

    if(penjamins.length !== validData.penjamin_uuids.length){
        throw new NotfoundException("Penjamin tidak ada");
    }

    const itemPemeriksaanUuids = []
    const kelomPokPemerikSaanUuids = []
    const nameTarifKomponenUuids = []

        validData.tarif_lab_items.map(async (item) => {
            if(item.item_pemeriksaan_uuid){
                itemPemeriksaanUuids.push(item.item_pemeriksaan_uuid);
            }

            if(item.kelompok_pemeriksaan_uuid){
                kelomPokPemerikSaanUuids.push(item.kelompok_pemeriksaan_uuid);
            }

            if(item.komponen_tindakan_labs){
                item.komponen_tindakan_labs.map(async (komponen) => {
                    nameTarifKomponenUuids.push(komponen.tarif_komponen_uuid);
                });
            }
        })

        const itemPemeriksaans = await ItemPemeriksaanRepository.findByUuids(itemPemeriksaanUuids);

        if(itemPemeriksaans.length !== itemPemeriksaanUuids.length){
            throw new NotfoundException("Item Pemeriksaan tidak ada");
        }

        const kelompokPemeriksaans = await KelompokPemeriksaanRepository.findByUuids(kelomPokPemerikSaanUuids);

        if(kelompokPemeriksaans.length !== kelomPokPemerikSaanUuids.length){
            throw new NotfoundException("Kelompok Pemeriksaan tidak ada");
        }

        const nameTarifKomponens = await NameTarifKomponenRepository.findByUuids(nameTarifKomponenUuids);

        if(nameTarifKomponens.length !== nameTarifKomponenUuids.length){
            throw new NotfoundException("Komponen Tarif tidak ada");
        }

        const tarifLab = await TarifLabRepository.create({
            code: validData.code,
            name: validData.name,
            status: validData.status,
            grand_total: validData.grand_total,
            faskes_uuid: validData.faskes_uuid
        });


        const tarifLabPenjamin = validData.penjamin_uuids.map(item =>{
            return {
                tarif_lab_uuid: tarifLab.uuid,
                penjamin_uuid: item,
                faskes_uuid: validData.faskes_uuid
            }
        }) 

        await TarifLabPenjaminRepository.bulkCreate(tarifLabPenjamin);

        const tarifLabPelayanan = validData.pelayanans.map(item =>{
            return {
                tarif_lab_uuid: tarifLab.uuid,
                pelayanan: item,
                faskes_uuid: validData.faskes_uuid
            }
        })

        await TarifLabPelayananRepository.bulkCreate(tarifLabPelayanan);

        const tarifLabItems = validData.tarif_lab_items.map(item =>{
            return {
                tarif_lab_uuid: tarifLab.uuid,
                kelompok_pemeriksaan_uuid: item.kelompok_pemeriksaan_uuid,
                item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
                faskes_uuid: validData.faskes_uuid
            }
        })

        await TarifLabItemRepository.bulkCreate(tarifLabItems);

        const tarifLabKomponenTindakan = []

        validData.tarif_lab_items.forEach(item => {
            item.komponen_tindakan_labs.forEach(komponen => {
                tarifLabKomponenTindakan.push({
                    tarif_lab_item_uuid: item.item_pemeriksaan_uuid,
                    tarif_komponen_uuid: komponen.tarif_komponen_uuid,
                    diskon: komponen.diskon,
                    tarif_per_komponen: komponen.tarif_per_komponen,
                    faskes_uuid: validData.faskes_uuid,
                    tarif_lab_uuid: tarifLab.uuid
                })
            });
        })

        await TarifKomponenTindakanLabRepository.bulkCreate(tarifLabKomponenTindakan);

    }

    static async findAll(req){
        return await TarifLabRepository.findAll(req);
    }

    static async delete(uuid){
        const isTarifLabExist = await TarifLabRepository.findByUuid(uuid);
        
        if (!isTarifLabExist) {
            throw new NotfoundException("Tarif Lab tidak ada");
        }
        Promise.all([
           await TarifLabPenjaminRepository.deleteByTarifLab(uuid),
           await TarifLabPelayananRepository.deleteByTarifLab(uuid),
           await TarifLabItemRepository.deleteByTarifLab(uuid),
           await TarifKomponenTindakanLabRepository.deleteByTarifLab(uuid)
        ])

        return await TarifLabRepository.delete(uuid);
    }

    static async update(uuid, req){
        const isTarifLabExist = await TarifLabRepository.findByUuid(uuid);

        if (!isTarifLabExist) {
            throw new NotfoundException("Tarif Lab tidak ada");
        }

        const validData = ZodValidator.validate(TarifLabValidation.UPDATE, req);

        const isCodeExist = await TarifLabRepository.findByCode(validData.code, validData.faskes_uuid);

        if (isCodeExist && isCodeExist.uuid !== uuid) {
            throw new ConflictException("Code sudah terdaftarkan");
        }

        const itemPemeriksaanUuids = []
        const kelomPokPemerikSaanUuids = []
        const nameTarifKomponenUuids = []
    
            validData.tarif_lab_items.map(async (item) => {
                if(item.item_pemeriksaan_uuid){
                    itemPemeriksaanUuids.push(item.item_pemeriksaan_uuid);
                }
    
                if(item.kelompok_pemeriksaan_uuid){
                    kelomPokPemerikSaanUuids.push(item.kelompok_pemeriksaan_uuid);
                }
    
                if(item.komponen_tindakan_labs){
                    item.komponen_tindakan_labs.map(async (komponen) => {
                        nameTarifKomponenUuids.push(komponen.tarif_komponen_uuid);
                    });
                }
            })
    
            const itemPemeriksaans = await ItemPemeriksaanRepository.findByUuids(itemPemeriksaanUuids);
    
            if(itemPemeriksaans.length !== itemPemeriksaanUuids.length){
                throw new NotfoundException("Item Pemeriksaan tidak ada");
            }
    
            const kelompokPemeriksaans = await KelompokPemeriksaanRepository.findByUuids(kelomPokPemerikSaanUuids);
    
            if(kelompokPemeriksaans.length !== kelomPokPemerikSaanUuids.length){
                throw new NotfoundException("Kelompok Pemeriksaan tidak ada");
            }
    
            const nameTarifKomponens = await NameTarifKomponenRepository.findByUuids(nameTarifKomponenUuids);
    
            if(nameTarifKomponens.length !== nameTarifKomponenUuids.length){
                throw new NotfoundException("Komponen Tarif tidak ada");
            }
    

        await TarifLabRepository.update(uuid, {
            code: validData.code,
            name: validData.name,
            status: validData.status,
            grand_total: validData.grand_total,
            faskes_uuid: validData.faskes_uuid
        });

       Promise.all([
        await TarifLabPenjaminRepository.deleteByTarifLab(uuid),

        await TarifLabPelayananRepository.deleteByTarifLab(uuid),

        await TarifLabItemRepository.deleteByTarifLab(uuid),

        await TarifKomponenTindakanLabRepository.deleteByTarifLab(uuid),
       ])

        const tarifLabPenjamin = validData.penjamin_uuids.map(item =>{
            return {
                tarif_lab_uuid: uuid,
                penjamin_uuid: item,
                faskes_uuid: validData.faskes_uuid
            }
        })

        await TarifLabPenjaminRepository.bulkCreate(tarifLabPenjamin);

        const tarifLabPelayanan = validData.pelayanans.map(item =>{
            return {
                tarif_lab_uuid: uuid,
                pelayanan: item,
                faskes_uuid: validData.faskes_uuid
            }
        })

        await TarifLabPelayananRepository.bulkCreate(tarifLabPelayanan);

        const tarifLabItems = validData.tarif_lab_items.map(item =>{
            return {
                tarif_lab_uuid: uuid,
                kelompok_pemeriksaan_uuid: item.kelompok_pemeriksaan_uuid,
                item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
                faskes_uuid: validData.faskes_uuid
            }
        })

        await TarifLabItemRepository.bulkCreate(tarifLabItems);

        const tarifLabKomponenTindakan = []

        validData.tarif_lab_items.forEach(item => {
            item.komponen_tindakan_labs.forEach(komponen => {
                tarifLabKomponenTindakan.push({
                    tarif_lab_item_uuid: item.item_pemeriksaan_uuid,
                    tarif_komponen_uuid: komponen.tarif_komponen_uuid,
                    diskon: komponen.diskon,
                    tarif_per_komponen: komponen.tarif_per_komponen,
                    faskes_uuid: validData.faskes_uuid,
                    tarif_lab_uuid: uuid
                })
            });
        })

        await TarifKomponenTindakanLabRepository.bulkCreate(tarifLabKomponenTindakan);
    }
}