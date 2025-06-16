import NilaiRujukanRepository from "../repositories/nilai-rujukan-repository.js";
import { JENIS_KELAMIN } from "../validations/nilai-rujukan-validation.js";

const calculateAgeInDays = (ageYear, ageMonth, ageDay) => {
  return ageYear * 365 + ageMonth * 30 + ageDay;
};

const filterNilaiRujukan = async (
  nilaiRujukanList,
  pasien,
  itemPemeriksaanList
) => {
  return itemPemeriksaanList.map((item) => {
    // Filter nilai rujukan yang sesuai dengan item pemeriksaan dan pasien
    const rujukanSesuai = nilaiRujukanList.filter((rujukan) => {
      // 1. Cek kecocokan item pemeriksaan
      if (rujukan.item_pemeriksaan_uuid !== item.item_pemeriksaan_uuid)
        return false;

      // 2. Hitung usia dalam hari menggunakan helper
      const usiaPasienHari = calculateAgeInDays(
        pasien.birth_detail.age_year,
        pasien.birth_detail.age_month,
        pasien.birth_detail.age_day
      );

      const umurBawahHari = calculateAgeInDays(
        rujukan.umur_bawah_tahun,
        rujukan.umur_bawah_bulan,
        rujukan.umur_bawah_hari
      );

      const umurAtasHari = calculateAgeInDays(
        rujukan.umur_atas_tahun,
        rujukan.umur_atas_bulan,
        rujukan.umur_atas_hari
      );

      // 3. Cek kesesuaian usia
      const usiaSesuai =
        usiaPasienHari >= umurBawahHari && usiaPasienHari <= umurAtasHari;

      // console.log(
      //   "usia eq = ",
      //   usiaSesuai,
      //   usiaPasienHari,
      //   umurBawahHari,
      //   umurAtasHari
      // );

      // 4. Cek kesesuaian jenis kelamin
      const jenisKelaminSesuai =
        rujukan.jenis_kelamin === JENIS_KELAMIN[2] ||
        rujukan.jenis_kelamin === pasien.gender;

      // console.log(
      //   "gender eq = ",
      //   jenisKelaminSesuai,
      //   pasien.gender,
      //   rujukan.jenis_kelamin
      // );

      return usiaSesuai && jenisKelaminSesuai;
    });

    // console.log("rujukan eq => ", rujukanSesuai);

    // Ambil nilai rujukan yang sesuai (prioritaskan yang bukan general jika ada)
    let rujukanTerpilih = null;
    if (rujukanSesuai.length > 0) {
      // Cari yang spesifik (bukan general) dulu
      rujukanTerpilih =
        rujukanSesuai.find((r) => r.jenis_kelamin !== "general") ||
        rujukanSesuai[0];
    }

    // console.log("rujukan terpilih ==> ", rujukanTerpilih);

    item.item_pemeriksaan.nilai_rujukan = rujukanTerpilih
      ? rujukanTerpilih.tampilan
      : null;

    // Return item pemeriksaan dengan data rujukan
    return {
      ...item,
    };
  });
};

const checkNilaiRujukan = async (hasil_pemeriksaan, patient, faskes_uuid) => {
  const itemPemeriksaanList = hasil_pemeriksaan;

  const itemPemeriksaanUuids = itemPemeriksaanList.map(
    (item) => item.item_pemeriksaan_uuid
  );

  const nilaiRujukanList = await NilaiRujukanRepository.findByItemPemeriksaans(
    itemPemeriksaanUuids,
    faskes_uuid
  );

  const hasilPemeriksaan = await filterNilaiRujukan(
    nilaiRujukanList,
    patient,
    itemPemeriksaanList
  );

  return hasilPemeriksaan;
};

export default checkNilaiRujukan;
