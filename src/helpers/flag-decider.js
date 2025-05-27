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
};

const flagDecider = async (hasil_pemeriksaan, patient, faskes_uuid) => {
  const itemPemeriksaanUuids = hasil_pemeriksaan.map(
    (item) => item.item_pemeriksaan_uuid
  );

  const nilaiRujukan = await NilaiRujukanRepository.findByItemPemeriksaans(
    itemPemeriksaanUuids,
    faskes_uuid
  );

  // return nilaiRujukan
  // Buat Hash Map untuk pencarian cepat (O(1))

  const nilaiRujukanMap = new Map();
  for (const item of nilaiRujukan) {
    nilaiRujukanMap.set(item.item_pemeriksaan_uuid, {
      ...item,
      totalUmurBawah: calculateAgeInDays(
        item.umur_bawah_tahun,
        item.umur_bawah_bulan,
        item.umur_bawah_hari
      ),
      totalUmurAtas: calculateAgeInDays(
        item.umur_atas_tahun,
        item.umur_atas_bulan,
        item.umur_atas_hari
      ),
    });
  }

  const totalUmur = calculateAgeInDays(
    patient.ageYear,
    patient.ageMonth,
    patient.ageDay
  );

  // Proses flag dengan O(n)
  return hasil_pemeriksaan
    .map((item) => {
      const nilai =
        nilaiRujukanMap.get(item.item_pemeriksaan_uuid)?.dataValues ?? null;

      if (!nilai) return null; // Tidak ada nilai rujukan

      // Cek umur pasien
      if (totalUmur < nilai.totalUmurBawah || totalUmur > nilai.totalUmurAtas) {
        return {
          item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
          observation_item_uuid: item.observation_item_uuid,
        };
      }

      // Normalisasi operator
      const operatorKritisAtas = nilai.operator_kritis_atas?.trim();
      const operatorKritisBawah = nilai.operator_kritis_bawah?.trim();
      const operatorNormal = nilai.operator_nilai_normal?.trim();

      // Cek jenis kelamin pasien
      const isGenderMatch =
        nilai.jenis_kelamin === JENIS_KELAMIN[2] || // Untuk semua gender
        patient.gender === nilai.jenis_kelamin ||
        nilai.jenis_kelamin === JENIS_KELAMIN[3]; // Tidak ditentukan

      if (!isGenderMatch) return null;

      // Handle text input
      if (
        [jenisInput.text, jenisInput.longText, jenisInput.pilihan].includes(
          item.jenis_input
        )
      ) {
        const isNormal = nilai.nilai_normal_text.includes(item.result);
        return {
          flag: isNormal ? flag.normal : flag.abnormal,
          item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
          observation_item_uuid: item.observation_item_uuid,
          result: item.result,
        };
      }

      // Handle numeric input
      if (item.jenis_input === jenisInput.angka) {
        const resultValue = parseInt(item.result, 10);

        // Check critical low
        if (operatorKritisBawah) {
          const isCriticalLow =
            (operatorKritisBawah === OPERATOR[0] &&
              resultValue < nilai.kritis_bawah) ||
            (operatorKritisBawah === OPERATOR[1] &&
              resultValue <= nilai.kritis_bawah);

          if (isCriticalLow) {
            return {
              flag: flag.kritisLow,
              item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
              observation_item_uuid: item.observation_item_uuid,
              result: resultValue,
            };
          }
        }

        // Check critical high
        if (operatorKritisAtas) {
          const isCriticalHigh =
            (operatorKritisAtas === OPERATOR[2] &&
              resultValue > nilai.kritis_atas) ||
            (operatorKritisAtas === OPERATOR[3] &&
              resultValue >= nilai.kritis_atas);

          if (isCriticalHigh) {
            return {
              flag: flag.kritisHigh,
              item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
              observation_item_uuid: item.observation_item_uuid,
              result: resultValue,
            };
          }
        }

        // Check normal range based on operator
        switch (operatorNormal) {
          case OPERATOR[4]: // "-" (range between)
            return {
              flag:
                resultValue < nilai.batas_bawah_nilai_normal
                  ? flag.low
                  : resultValue > nilai.batas_atas_nilai_normal
                  ? flag.high
                  : flag.normal,
              item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
              observation_item_uuid: item.observation_item_uuid,
              result: resultValue,
            };

          case OPERATOR[0]: // "<"
            return {
              flag:
                resultValue < nilai.batas_atas_nilai_normal
                  ? flag.normal
                  : flag.high,
              item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
              observation_item_uuid: item.observation_item_uuid,
              result: resultValue,
            };

          case OPERATOR[1]: // "<="
            return {
              flag:
                resultValue <= nilai.batas_atas_nilai_normal
                  ? flag.normal
                  : flag.high,
              item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
              observation_item_uuid: item.observation_item_uuid,
              result: resultValue,
            };

          case OPERATOR[2]: // ">"
            return {
              flag:
                resultValue > nilai.batas_bawah_nilai_normal
                  ? flag.normal
                  : flag.low,
              item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
              observation_item_uuid: item.observation_item_uuid,
              result: resultValue,
            };

          case OPERATOR[3]: // ">="
            return {
              flag:
                resultValue >= nilai.batas_bawah_nilai_normal
                  ? flag.normal
                  : flag.low,
              item_pemeriksaan_uuid: item.item_pemeriksaan_uuid,
              observation_item_uuid: item.observation_item_uuid,
              result: resultValue,
            };

          default:
            return null;
        }
      }

      return null;
    })
    .filter(Boolean); // Hapus nilai null dari hasil
};

export default flagDecider;
