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
import { parse } from "dotenv";
import calculatePersen from "../helpers/calculate_persen.js";
import calculateRupiah from "../helpers/calculate_rupiah.js";
import convertRupiahToNumber from "../helpers/convert_rupiah_to_number.js";

export default class TarifLabService {
  static async create(req) {
    console.log(JSON.stringify(req));
    const validData = ZodValidator.validate(TarifLabValidation.CREATE, req);
    const isCodeExist = await TarifLabRepository.findByCode(
      validData.code,
      validData.faskes_uuid
    );
    if (isCodeExist) {
      throw new ConflictException("Kode sudah ada");
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

    validData.tarif_lab_items.map(async (item, i) => {
      let uuid = uuidv7();
      if (!item.komponen_tindakan_labs) {
        throw new NotfoundException("Komponen Tarif tidak boleh kosong");
      }

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

      validData.tarif_lab_items[i] = {
        ...validData.tarif_lab_items[i],
        uuid: uuid,
      };
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

    // if (nameTarifKomponens.length !== nameTarifKomponenUuids.length) {
    //   console.log(
    //     "name tarif ==> ",
    //     nameTarifKomponens.length,
    //     nameTarifKomponens
    //   );
    //   console.log(
    //     "name tarif uuid ==> ",
    //     nameTarifKomponenUuids.length,
    //     nameTarifKomponenUuids
    //   );
    //   throw new NotfoundException("Komponen Tarif tidak ada");
    // }

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

      const tarifLabItems = validData.tarif_lab_items.map((item) => {
        return {
          uuid: item.uuid,
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

    const isCodeExist = await TarifLabRepository.findByCodeWithoutItself(
      uuid,
      req
    );

    if (isCodeExist) {
      throw new ConflictException("Kode sudah ada");
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
    const tarifMap = new Map(); // Simpan berdasarkan kodeTarif
    const workSheet = await extractExcel(path);

    workSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const kodeTarif = row.getCell(2).value;
      const namaTarif = row.getCell(3).value;
      const pelayanan = row.getCell(4).value;
      const metodePembayaran = row.getCell(5).value;
      const kelompokPemeriksaan = row.getCell(6).value;
      const itemPemeriksaan = row.getCell(7).value;
      const komponenTarif = row.getCell(8).value;
      // const persentase = Boolean(row.getCell(9).value);
      // const hargaTarifPersen = row.getCell(10).value
      //   ? parseFloat(row.getCell(10).value)
      //   : null;
      const hargaTarifRupiah = row.getCell(9).value
        ? convertRupiahToNumber(String(row.getCell(9)))
        : null;

      // const komponenTarifItem = row.getCell(12).value;
      // const presentaseItem = Boolean(row.getCell(13).value);
      // const hargaTarifPersenItem = row.getCell(14).value
      //   ? parseFloat(row.getCell(14).value)
      //   : null;
      // const hargaTarifRupiahItem = row.getCell(15).value
      //   ? convertRupiahToNumber(String(row.getCell(15)))
      //   : null;
      const totalHargaKomponenTarif = convertRupiahToNumber(
        String(row.getCell(10).value)
      );
      const grandTotalItem = convertRupiahToNumber(
        String(row.getCell(11).value)
      );
      // Gunakan kodeTarif sebagai key unik
      let currentTarif = tarifMap.get(kodeTarif);

      if (kodeTarif && !currentTarif) {
        currentTarif = {
          code: kodeTarif,
          name: namaTarif,
          pelayanans: pelayanan
            ? String(pelayanan)
                .split(",")
                .map((i) => i.trim())
            : [],
          penjamins: metodePembayaran
            ? String(metodePembayaran)
                .split(",")
                .map((i) => i.trim())
            : [],
          tarif_lab_items: [],
          faskes_uuid: faskes_uuid,
          grand_total: grandTotalItem,
          status: true,
        };
        tarifMap.set(kodeTarif, currentTarif);
        data.push(currentTarif);
      }
      // else {
      //   currentTarif.grand_total += grandTotalItem;
      // }

      // Tambahkan pemeriksaan kalau sudah ada tarif
      if (currentTarif) {
        const pemeriksaans = currentTarif.tarif_lab_items;

        if (kelompokPemeriksaan) {
          let existingKelompok = pemeriksaans.find(
            (p) => p.code === kelompokPemeriksaan && p.jenis === "kelompok"
          );
          if (!existingKelompok) {
            existingKelompok = {
              code: kelompokPemeriksaan,
              jenis: "kelompok",
              total_tarif: parseInt(totalHargaKomponenTarif),
              komponen_tarif: [],
            };
            pemeriksaans.push(existingKelompok);
          }

          existingKelompok.komponen_tarif.push({
            code: komponenTarif,
            prosentase_per_komponen: 0,
            tarif_per_komponen: hargaTarifRupiah ?? 0,
          });
        }

        if (itemPemeriksaan) {
          let existingItem = pemeriksaans.find(
            (p) => p.code === itemPemeriksaan && p.jenis === "item"
          );
          if (!existingItem) {
            existingItem = {
              code: itemPemeriksaan,
              jenis: "item",
              total_tarif: parseInt(totalHargaKomponenTarif),
              komponen_tarif: [],
            };
            pemeriksaans.push(existingItem);
          }

          existingItem.komponen_tarif.push({
            code: komponenTarif,
            prosentase_per_komponen: 0,
            tarif_per_komponen: hargaTarifRupiah ?? 0,
          });
        }
      }
    });

    const allPenjamins = data.map((d) => d.penjamins).flat();
    const uniquePenjamin = [...new Set(allPenjamins)];

    const allItemPemeriksaan = data
      .map((d) =>
        d.tarif_lab_items.filter((p) => p.jenis === "item").map((p) => p.code)
      )
      .flat();

    const allKelompokPemeriksaan = data
      .map((d) =>
        d.tarif_lab_items
          .filter((p) => p.jenis === "kelompok")
          .map((p) => p.code)
      )
      .flat();

    const allKomponen = data
      .map((d) =>
        d.tarif_lab_items.flatMap((p) => p.komponen_tarif.map((k) => k.code))
      )
      .flat();

    // Ambil yang unik
    const uniqueItemPemeriksaan = [...new Set(allItemPemeriksaan)];
    const uniqueKelompokPemeriksaan = [...new Set(allKelompokPemeriksaan)];
    const uniqueKomponen = [...new Set(allKomponen)];

    const [
      penjaminList,
      kelompokPemeriksaanList,
      itemPemeriksaanList,
      komponenList,
    ] = await Promise.all([
      PenjaminRepository.findByCodeIn(uniquePenjamin, faskes_uuid),
      KelompokPemeriksaanRepository.findByCodeIn(
        uniqueKelompokPemeriksaan,
        faskes_uuid
      ),
      ItemPemeriksaanRepository.findByCodeIn(
        uniqueItemPemeriksaan,
        faskes_uuid
      ),
      NameTarifKomponenRepository.findByCodeIn(uniqueKomponen, faskes_uuid),
    ]);

    // return data

    data.forEach((item, index) => {
      // Ubah penjamins: dari code jadi uuid
      item.penjamin_uuids = item.penjamins.map((p) => {
        const penjamin = penjaminList.find((pen) => pen.code === p);
        if (!penjamin) {
          throw new NotfoundException(`Penjamin ${p} tidak ditemukan`);
        }
        return penjamin.uuid;
      });

      // Ubah tarif_lab_items: kelompok -> replace code dengan uuid
      item.tarif_lab_items = item.tarif_lab_items.map((p) => {
        if (p.jenis === "kelompok") {
          const pemeriksaan = kelompokPemeriksaanList.find(
            (k) => k.code === p.code
          );
          if (!pemeriksaan) {
            throw new NotfoundException(
              `Kelompok Pemeriksaan ${p.code} tidak ditemukan`
            );
          }
          return {
            ...p,
            kelompok_pemeriksaan_uuid: pemeriksaan.uuid, // replace code dengan uuid
          };
        }

        if (p.jenis === "item") {
          const itemPemeriksaan = itemPemeriksaanList.find(
            (k) => k.code === p.code
          );
          if (!itemPemeriksaan) {
            throw new NotfoundException(
              `Item Pemeriksaan ${p.code} tidak ditemukan`
            );
          }
          return {
            ...p,
            item_pemeriksaan_uuid: itemPemeriksaan.uuid,
          };
        }

        return p; // kalau jenis lain, biarkan
      });

      // Ubah komponen_tarif di setiap tarif_lab_item
      item.tarif_lab_items = item.tarif_lab_items.map((p) => {
        if (Array.isArray(p.komponen_tarif)) {
          const komponen_tarif = p.komponen_tarif.map((k) => {
            const komponen = komponenList.find((kom) => kom.code === k.code);
            if (!komponen) {
              throw new NotfoundException(`Komponen ${k.code} tidak ditemukan`);
            }
            return {
              ...k,
              tarif_komponen_uuid: komponen.uuid, // replace code dengan uuid
            };
          });
          return {
            ...p,
            komponen_tindakan_labs: komponen_tarif,
          };
        }

        return p;
      });
    });

    const validData = data.map((item) =>
      ZodValidator.validate(TarifLabValidation.CREATE, item)
    );

    console.log("req ==> ", JSON.stringify(validData));

    //  return validData
    await sequelizeInstance.transaction(async (t) => {
      for (const [id, data] of validData.entries()) {
        const tarifLab = await TarifLabRepository.create(data, t);

        const tarifLabPenjamin = data.penjamin_uuids.map((item) => ({
          tarif_lab_uuid: tarifLab.uuid,
          penjamin_uuid: item,
          faskes_uuid: data.faskes_uuid,
        }));
        await TarifLabPenjaminRepository.bulkCreate(tarifLabPenjamin, t);

        const tarifLabPelayanan = data.pelayanans.map((item) => ({
          tarif_lab_uuid: tarifLab.uuid,
          pelayanan: item,
          faskes_uuid: data.faskes_uuid,
        }));
        await TarifLabPelayananRepository.bulkCreate(tarifLabPelayanan, t);

        const tarifLabItems = data.tarif_lab_items.map((item, i) => {
          const uuid = uuidv7();
          const updatedItem = { ...item, uuid };

          data.tarif_lab_items[i] = updatedItem;
          return {
            uuid: updatedItem.uuid,
            tarif_lab_uuid: tarifLab.uuid,
            kelompok_pemeriksaan_uuid: item.kelompok_pemeriksaan_uuid,
            item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
            faskes_uuid: data.faskes_uuid,
            total_tarif: item.total_tarif,
          };
        });
        await TarifLabItemRepository.bulkCreate(tarifLabItems, t);

        const tarifLabKomponenTindakan = [];
        data.tarif_lab_items.forEach((item) => {
          item.komponen_tindakan_labs.forEach((komponen) => {
            tarifLabKomponenTindakan.push({
              tarif_lab_item_uuid: item.uuid,
              tarif_komponen_uuid: komponen.tarif_komponen_uuid,
              diskon: komponen.diskon,
              tarif_per_komponen: komponen.tarif_per_komponen,
              faskes_uuid: data.faskes_uuid,
              tarif_lab_uuid: tarifLab.uuid,
              prosentase_per_komponen: komponen.prosentase_per_komponen,
            });
          });
        });
        await TarifKomponenTindakanLabRepository.bulkCreate(
          tarifLabKomponenTindakan,
          t
        );
      }
    });
  }

  static async findAllActive(req) {
    const tarifLabs = await TarifLabRepository.findAllActive(req);

    const result = {
      category: [],
      non_category: [],
    };

    // Pertama, kumpulkan semua kategori unik dan tarifnya
    const categoriesMap = new Map();

    tarifLabs.data.forEach((tarif) => {
      let firstCategory = null;
      let allSameCategory = true;

      // Cek konsistensi kategori semua item dalam tarif
      for (const item of tarif.tarif_lab_item) {
        const category =
          item.item_pemeriksaan?.category_pemeriksaan ||
          item.kelompok_pemeriksaan?.category_pemeriksaan;

        if (!category) {
          allSameCategory = false;
          break;
        }

        if (!firstCategory) {
          firstCategory = category;
        } else if (
          category.uuid !== firstCategory.uuid ||
          category.code !== firstCategory.code
        ) {
          allSameCategory = false;
          break;
        }
      }

      // Jika semua item memiliki kategori yang sama
      if (allSameCategory && firstCategory) {
        const categoryKey = `${firstCategory.uuid}-${firstCategory.code}`;

        if (!categoriesMap.has(categoryKey)) {
          categoriesMap.set(categoryKey, {
            name: firstCategory.name,
            code: firstCategory.code,
            no_urut: firstCategory.no_urut,
            tarif_lab: [],
          });
        }

        categoriesMap.get(categoryKey).tarif_lab.push({
          uuid: tarif.uuid,
          name: tarif.name,
          code: tarif.code,
          grand_total: tarif.grand_total,
        });
      } else {
        // Jika berbeda kategori atau tidak ada kategori
        result.non_category.push({
          name: tarif.name,
          code: tarif.code,
          grand_total: tarif.grand_total,
        });
      }
    });

    // Konversi Map ke array untuk category
    result.category = Array.from(categoriesMap.values()).sort(
      (a, b) => a.no_urut - b.no_urut
    );

    return result;
  }
}
