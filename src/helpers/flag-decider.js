import NilaiRujukanRepository from "../repositories/nilai-rujukan-repository.js";
import {
  JENIS_KELAMIN,
  OPERATOR,
} from "../validations/nilai-rujukan-validation.js";

const jenisInput = {
  text: "text",
  angka: "angka",
  longText: "long text",
  pilihan: "pilihan",
};

const flag = {
  normal: "N",
  abnormal: "TN",
  low: "L",
  high: "H",
  kritisHigh: "KH",
  kritisLow: "KL",
};

const calculateAgeInDays = (ageYear, ageMonth, ageDay) => {
    return ageYear * 365 + ageMonth * 30 + ageDay;
}

const flagDecider = async (hasil_pemeriksaan, patient, faskes_uuid) => {
    const itemPemeriksaanUuids = hasil_pemeriksaan.map(item => item.item_pemeriksaan_uuid);
    const nilaiRujukan = await NilaiRujukanRepository.findByItemPemeriksaans(itemPemeriksaanUuids, faskes_uuid);
    // return nilaiRujukan
    // Buat Hash Map untuk pencarian cepat (O(1))
    const nilaiRujukanMap = new Map();
    for (const item of nilaiRujukan) {
        nilaiRujukanMap.set(item.item_pemeriksaan_uuid, {
            ...item,
            totalUmurBawah: calculateAgeInDays(item.umur_bawah_tahun, item.umur_bawah_bulan, item.umur_bawah_hari),
            totalUmurAtas: calculateAgeInDays(item.umur_atas_tahun, item.umur_atas_bulan, item.umur_atas_hari)
        });
    }

    const totalUmur = calculateAgeInDays(patient.ageYear, patient.ageMonth, patient.ageDay);

    // Proses flag dengan O(n)
    return hasil_pemeriksaan.map(item => {
        let nilai = nilaiRujukanMap.get(item.item_pemeriksaan_uuid);
        nilai = nilai.dataValues;

        if (!nilai) return null; // Tidak ada nilai rujukan

        if (totalUmur < nilai.totalUmurBawah || totalUmur > nilai.totalUmurAtas) {
            return {
                item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
                observation_item_uuid: item.observation_item_uuid
            }
        };

        nilai.operator_kritis_atas = nilai.operator_kritis_atas.trim()
        nilai.operator_kritis_bawah = nilai.operator_kritis_bawah.trim()
        nilai.operator_nilai_normal = nilai.operator_nilai_normal.trim()

        if (nilai.jenis_kelamin === JENIS_KELAMIN[2] || patient.gender === nilai.jenis_kelamin || nilai.jenis_kelamin === JENIS_KELAMIN[3]) {
            if ([jenisInput.text, jenisInput.longText, jenisInput.pilihan].includes(item.jenis_input)) {
                return {
                    flag: nilai.nilai_normal_text.includes(item.result) ? flag.normal : flag.abnormal,
                    item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
                    observation_item_uuid: item.observation_item_uuid,
                    result : item.result
                };
            }

            if (item.jenis_input === jenisInput.angka) {
                item.result = parseInt(item.result)
                if (nilai.operator_kritis_bawah) {
                    if ((nilai.operator_kritis_bawah === OPERATOR[0] && item.result < nilai.kritis_bawah) ||
                    (nilai.operator_kritis_bawah === OPERATOR[1] && item.result <= nilai.kritis_bawah)) {
                        return { flag: flag.kritisLow, item_pemeriksaan_uuid: item.item_pemeriksaan_uuid, observation_item_uuid: item.observation_item_uuid, result : item.result };
                    }
                }
                
                if (nilai.operator_kritis_atas) {            
                    if ((nilai.operator_kritis_atas === OPERATOR[2] && item.result > nilai.kritis_atas) ||
                    (nilai.operator_kritis_atas === OPERATOR[3] && item.result >= nilai.kritis_atas)) {
                        return { flag: flag.kritisHigh, item_pemeriksaan_uuid: item.item_pemeriksaan_uuid, observation_item_uuid: item.observation_item_uuid, result : item.result };
                    }
                }
                    if (nilai.operator_nilai_normal === OPERATOR[4]) { // "-"
                        return {
                            flag: item.result < nilai.batas_bawah_nilai_normal ? flag.low
                            : item.result > nilai.batas_atas_nilai_normal ? flag.high
                            : flag.normal,
                            item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
                            observation_item_uuid: item.observation_item_uuid,
                            result : item.result
                        };
                    }
                    
                    if (nilai.operator_nilai_normal === OPERATOR[0]) { // "<"
                        return {
                            flag: item.result < nilai.batas_atas_nilai_normal ? flag.normal : flag.high,
                            item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
                            observation_item_uuid: item.observation_item_uuid,
                            result : item.result
                        };
                    }
                    
                    if (nilai.operator_nilai_normal === OPERATOR[1]) { // "<="
                        return {
                            flag: item.result <= nilai.batas_atas_nilai_normal ? flag.normal : flag.high,
                            item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
                            observation_item_uuid: item.observation_item_uuid,
                            result: item.result
                        };
                    }
                    
                    if (nilai.operator_nilai_normal === OPERATOR[2]) { // ">"
                        return {
                            flag: item.result > nilai.batas_bawah_nilai_normal ? flag.normal : flag.low,
                            item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
                            observation_item_uuid: item.observation_item_uuid,
                            result :item.result
                        };
                    }
                    
                    if (nilai.operator_nilai_normal === OPERATOR[3]) { // ">="
                        return {
                            flag: item.result >= nilai.batas_bawah_nilai_normal ? flag.normal : flag.high,
                            item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
                            observation_item_uuid: item.observation_item_uuid,
                            result:item.result
                        }
                    }
                
            }
        }

        return null;
    }).filter(Boolean); // Hapus nilai null dari hasil
};

export default flagDecider;


