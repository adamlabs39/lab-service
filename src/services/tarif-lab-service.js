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
import sequelizeInstance from "@adameds/model-sdk/instance";
import { uuidv7 } from "uuidv7";
import extractExcel from "../helpers/extract-excel.js";
import { map } from "zod";

export default class TarifLabService {
  static async create(req) {
    const validData = ZodValidator.validate(TarifLabValidation.CREATE, req);
    const isCodeExist = await TarifLabRepository.findByCode(
      validData.code,
      validData.faskes_uuid
    );
    if (isCodeExist) {
      throw new ConflictException("Code sudah terdaftarkan");
    }

    const penjamins = await PenjaminRepository.findByUuids(
      validData.penjamin_uuids
    );

    if (penjamins.length !== validData.penjamin_uuids.length) {
      throw new NotfoundException("Penjamin tidak ada");
    }

    const itemPemeriksaanUuids = [];
    const kelomPokPemerikSaanUuids = [];
    const nameTarifKomponenUuids = [];

    validData.tarif_lab_items.map(async (item) => {
      if (item.item_pemeriksaan_uuid) {
        itemPemeriksaanUuids.push(item.item_pemeriksaan_uuid);
      }

      if (item.kelompok_pemeriksaan_uuid) {
        kelomPokPemerikSaanUuids.push(item.kelompok_pemeriksaan_uuid);
      }

      if (item.komponen_tindakan_labs) {
        item.komponen_tindakan_labs.map(async (komponen) => {
          nameTarifKomponenUuids.push(komponen.tarif_komponen_uuid);
        });
      }
    });

    const itemPemeriksaans = await ItemPemeriksaanRepository.findByUuids(
      itemPemeriksaanUuids
    );

    if (itemPemeriksaans.length !== itemPemeriksaanUuids.length) {
      throw new NotfoundException("Item Pemeriksaan tidak ada");
    }

    const kelompokPemeriksaans =
      await KelompokPemeriksaanRepository.findByUuids(kelomPokPemerikSaanUuids);

    if (kelompokPemeriksaans.length !== kelomPokPemerikSaanUuids.length) {
      throw new NotfoundException("Kelompok Pemeriksaan tidak ada");
    }

    const nameTarifKomponens = await NameTarifKomponenRepository.findByUuids(
      nameTarifKomponenUuids
    );

    if (nameTarifKomponens.length !== nameTarifKomponenUuids.length) {
      throw new NotfoundException("Komponen Tarif tidak ada");
    }

    sequelizeInstance.transaction(async (t) => {
      const tarifLab = await TarifLabRepository.create(validData, t);

      const tarifLabPenjamin = validData.penjamin_uuids.map((item) => {
        return {
          tarif_lab_uuid: tarifLab.uuid,
          penjamin_uuid: item,
          faskes_uuid: validData.faskes_uuid,
        };
      });

      await TarifLabPenjaminRepository.bulkCreate(tarifLabPenjamin, t);

      const tarifLabPelayanan = validData.pelayanans.map((item) => {
        return {
          tarif_lab_uuid: tarifLab.uuid,
          pelayanan: item,
          faskes_uuid: validData.faskes_uuid,
        };
      });

      await TarifLabPelayananRepository.bulkCreate(tarifLabPelayanan, t);

      const tarifLabItems = validData.tarif_lab_items.map((item, i) => {
        let uuid = uuidv7();
        validData.tarif_lab_items[i] = {
          ...validData.tarif_lab_items[i],
          uuid: uuid,
        };
        return {
          tarif_lab_uuid: tarifLab.uuid,
          kelompok_pemeriksaan_uuid: item.kelompok_pemeriksaan_uuid,
          item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
          faskes_uuid: validData.faskes_uuid,
          total_tarif: item.total_tarif,
        };
      });

      await TarifLabItemRepository.bulkCreate(tarifLabItems, t);

      const tarifLabKomponenTindakan = [];

      validData.tarif_lab_items.forEach((item) => {
        item.komponen_tindakan_labs.map((komponen) => {
          tarifLabKomponenTindakan.push({
            tarif_lab_item_uuid: item.uuid,
            tarif_komponen_uuid: komponen.tarif_komponen_uuid,
            diskon: komponen.diskon,
            tarif_per_komponen: komponen.tarif_per_komponen,
            faskes_uuid: validData.faskes_uuid,
            tarif_lab_uuid: tarifLab.uuid,
            prosentase_per_komponen: komponen.prosentase_per_komponen,
          });
        });
      });

      await TarifKomponenTindakanLabRepository.bulkCreate(
        tarifLabKomponenTindakan,
        t
      );
    });
  }

  static async findAll(req) {
    return await TarifLabRepository.findAll(req);
  }

  static async delete(uuid) {
    const isTarifLabExist = await TarifLabRepository.findByUuid(uuid);

    if (!isTarifLabExist) {
      throw new NotfoundException("Tarif Lab tidak ada");
    }
    sequelizeInstance.transaction(async (t) => {
      Promise.all([
        await TarifLabPenjaminRepository.deleteByTarifLab(uuid, t),
        await TarifLabPelayananRepository.deleteByTarifLab(uuid, t),
        await TarifLabItemRepository.deleteByTarifLab(uuid, t),
        await TarifKomponenTindakanLabRepository.deleteByTarifLab(uuid, t),
      ]);

      return await TarifLabRepository.delete(uuid, t);
    });
  }

  static async show(uuid) {
    const tarifLab = await TarifLabRepository.findByUuid(uuid);

    if (!tarifLab) {
      throw new NotfoundException("Tarif Lab tidak ada");
    }

    return tarifLab;
  }

  static async update(uuid, req) {
    const isTarifLabExist = await TarifLabRepository.findByUuid(uuid);

    if (!isTarifLabExist) {
      throw new NotfoundException("Tarif Lab tidak ada");
    }

    const validData = ZodValidator.validate(TarifLabValidation.UPDATE, req);

    const isCodeExist = await TarifLabRepository.findByCode(
      validData.code,
      validData.faskes_uuid
    );

    if (isCodeExist && isCodeExist.uuid !== uuid) {
      throw new ConflictException("Code sudah terdaftarkan");
    }

    const itemPemeriksaanUuids = [];
    const kelomPokPemerikSaanUuids = [];
    const nameTarifKomponenUuids = [];

    validData.tarif_lab_items.map(async (item) => {
      if (item.item_pemeriksaan_uuid) {
        itemPemeriksaanUuids.push(item.item_pemeriksaan_uuid);
      }

      if (item.kelompok_pemeriksaan_uuid) {
        kelomPokPemerikSaanUuids.push(item.kelompok_pemeriksaan_uuid);
      }

      if (item.komponen_tindakan_labs) {
        item.komponen_tindakan_labs.map(async (komponen) => {
          nameTarifKomponenUuids.push(komponen.tarif_komponen_uuid);
        });
      }
    });

    const itemPemeriksaans = await ItemPemeriksaanRepository.findByUuids(
      itemPemeriksaanUuids
    );

    if (itemPemeriksaans.length !== itemPemeriksaanUuids.length) {
      throw new NotfoundException("Item Pemeriksaan tidak ada");
    }

    const kelompokPemeriksaans =
      await KelompokPemeriksaanRepository.findByUuids(kelomPokPemerikSaanUuids);

    if (kelompokPemeriksaans.length !== kelomPokPemerikSaanUuids.length) {
      throw new NotfoundException("Kelompok Pemeriksaan tidak ada");
    }

    const nameTarifKomponens = await NameTarifKomponenRepository.findByUuids(
      nameTarifKomponenUuids
    );

    if (nameTarifKomponens.length !== nameTarifKomponenUuids.length) {
      throw new NotfoundException("Komponen Tarif tidak ada");
    }

    await sequelizeInstance.transaction(async (t) => {
      await TarifLabRepository.update(uuid, validData, t);

      await TarifLabPenjaminRepository.deleteByTarifLab(uuid, t);
      const tarifLabPenjamin = validData.penjamin_uuids.map((item) => {
        return {
          tarif_lab_uuid: uuid,
          penjamin_uuid: item,
          faskes_uuid: validData.faskes_uuid,
        };
      });

      await TarifLabPenjaminRepository.bulkCreate(tarifLabPenjamin, t);

      await TarifLabPelayananRepository.deleteByTarifLab(uuid, t);
      const tarifLabPelayanan = validData.pelayanans.map((item) => {
        return {
          tarif_lab_uuid: uuid,
          pelayanan: item,
          faskes_uuid: validData.faskes_uuid,
        };
      });

      await TarifLabPelayananRepository.bulkCreate(tarifLabPelayanan, t);

      await TarifLabItemRepository.deleteByTarifLab(uuid, t);
      const tarifLabItems = validData.tarif_lab_items.map((item) => {
        return {
          tarif_lab_uuid: uuid,
          kelompok_pemeriksaan_uuid: item.kelompok_pemeriksaan_uuid,
          item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
          faskes_uuid: validData.faskes_uuid,
          total_tarif: item.total_tarif,
        };
      });

      await TarifLabItemRepository.bulkCreate(tarifLabItems, t);

      await TarifKomponenTindakanLabRepository.deleteByTarifLab(uuid, t);
      const tarifLabKomponenTindakan = [];

      validData.tarif_lab_items.forEach((item) => {
        item.komponen_tindakan_labs.forEach((komponen) => {
          tarifLabKomponenTindakan.push({
            tarif_lab_item_uuid: item.item_pemeriksaan_uuid,
            tarif_komponen_uuid: komponen.tarif_komponen_uuid,
            diskon: komponen.diskon,
            tarif_per_komponen: komponen.tarif_per_komponen,
            faskes_uuid: validData.faskes_uuid,
            tarif_lab_uuid: uuid,
            prosentase_per_komponen: komponen.prosentase_per_komponen,
          });
        });
      });

      await TarifKomponenTindakanLabRepository.bulkCreate(
        tarifLabKomponenTindakan,
        t
      );
    });
  }

  static async import(path, faskes_uuid) {
    const data = [];

    const workSheet = await extractExcel(path);
    let currentTarif = null;

    workSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const kodeTarif = row.getCell(2).value; // Kolom "Kode Tarif"
      const namaTarif = row.getCell(3).value; // Kolom "Nama Tarif"
      const pelayanan = row.getCell(4).value; // Kolom "Pelayanan"
      const metodePembayaran = row.getCell(5).value; // Kolom "Metode Pembayaran"
      const kelompokPemeriksaan = row.getCell(6).value; // Kolom "Kelompok Pemeriksaan"
      const komponenTarif = row.getCell(7).value; // Kolom "Komponen Tarif"
      const persentase = row.getCell(8).value; // Kolom "Persentase"
      const hargaTarifPersen = row.getCell(9).value; // Kolom "Harga Tarif (persen)"
      const hargaTarifRupiah = row.getCell(10).value; // Kolom "Harga Tarif (rupiah)"
      const itemPemeriksaan = row.getCell(11).value; // Kolom "Item Pemeriksaan"
      const komponenTarifItem = row.getCell(12).value; // Kolom "Komponen Tarif Item"
      const presentaseItem = row.getCell(13).value; // Kolom "Persentase Item"
      const hargaTarifPersenItem = row.getCell(14).value; // Kolom "Harga Tarif Item (persen)"
      const hargaTarifRupiahItem = row.getCell(15).value; // Kolom "Harga Tarif Item (rupiah)"

      // Jika ada kode tarif baru, buat entri baru
      if (kodeTarif) {
        currentTarif = {
          kode_tarif: kodeTarif,
          nama_tarif: namaTarif,
          pelayanans: pelayanan ? String(pelayanan).split(",").map((i) => i.trim()) : [],
          penjamins: metodePembayaran ? String(metodePembayaran).split(",").map((i) => i.trim()) : [],
          pemeriksaans: [], // Gabungan kelompok pemeriksaan dan item pemeriksaan
        };
        data.push(currentTarif);
      }

      // Pastikan ada tarif sebelum menambahkan kelompok/item pemeriksaan
      if (currentTarif) {
        const pemeriksaans = currentTarif.pemeriksaans;

        // **Handle Kelompok Pemeriksaan**
        if (kelompokPemeriksaan) {
          let existingKelompok = pemeriksaans.find((p) => p.nama === kelompokPemeriksaan && p.jenis === "kelompok");
          if (!existingKelompok) {
            existingKelompok = {
              nama: kelompokPemeriksaan,
              jenis: "kelompok",
              komponen_tarif: [],
            };
            pemeriksaans.push(existingKelompok);
          }

          // Tambahkan komponen tarif ke kelompok pemeriksaan yang sesuai
          existingKelompok.komponen_tarif.push({
            nama: komponenTarif,
            persentase: persentase,
            harga_tarif_persen: hargaTarifPersen,
            harga_tarif_rupiah: hargaTarifRupiah,
          });
        }

        // **Handle Item Pemeriksaan**
        if (itemPemeriksaan) {
          let existingItem = pemeriksaans.find((p) => p.nama === itemPemeriksaan && p.jenis === "item");
          if (!existingItem) {
            existingItem = {
              nama: itemPemeriksaan,
              jenis: "item",
              komponen_tarif: [],
            };
            pemeriksaans.push(existingItem);
          }

          // Tambahkan komponen tarif ke item pemeriksaan yang sesuai
          existingItem.komponen_tarif.push({
            nama: komponenTarifItem,
            persentase: presentaseItem,
            harga_tarif_persen: hargaTarifPersenItem,
            harga_tarif_rupiah: hargaTarifRupiahItem,
          });
        }
      }
    });

    const allCode = [...new Set(data.map((i) => i.kode_tarif))];

    // const isThereDuplicateCode = await TarifLabRepository.findByCodeIn(allCode, faskes_uuid);

    // if (isThereDuplicateCode) {
    //   throw new ConflictException("Code ada yang duplicate");
    // }

    const allPenjamins = data.map((d) => d.penjamins).flat();
    const allPelayanans = data.map((d) => d.pelayanans).flat();
    const allPemeriksaans = data.map((d) => d.pemeriksaans.map((p) => p.nama)).flat();
    const uniquePenjamin = [...new Set(allPenjamins)];
    const uniquePemeriksaans = [...new Set(allPemeriksaans)];

    const [penjaminList, pemeriksaanList] = await Promise.all([
      PenjaminRepository.findByNameIn(uniquePenjamin, faskes_uuid),
      KelompokPemeriksaanRepository.findByNameIn(uniquePemeriksaans, faskes_uuid),
    ]);

    return data;
  }

}
