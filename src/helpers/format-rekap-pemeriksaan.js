export function formatPemeriksaanPerTanggal(data) {
  const result = {};

  // Make sure data is an array
  if (!Array.isArray(data)) {
    return [];
  }

  data.forEach((item) => {
    // Check if required properties exist
    if (!item?.order_lab?.created_at || !item?.tarif_lab?.tarif_lab_item) {
      return;
    }

    // Format date
    const date = new Date(
      parseInt(item.order_lab.created_at) * 1000
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Process each tarif_lab_item
    item.tarif_lab.tarif_lab_item.forEach((p) => {
      // Determine pemeriksaan name
      let pemeriksaanName = null;

      if (p.item_pemeriksaan_uuid && p.item_pemeriksaan) {
        pemeriksaanName = p.item_pemeriksaan.name;
      } else if (p.kelompok_pemeriksaan_uuid && p.kelompok_pemeriksaan) {
        pemeriksaanName = p.kelompok_pemeriksaan.name;
      }

      // Skip if no valid name found
      if (!pemeriksaanName) return;

      // Create unique key
      const key = `${date}-${pemeriksaanName}`;

      // Initialize or increment count
      if (!result[key]) {
        result[key] = {
          tanggal: date,
          nama_pemeriksaan: pemeriksaanName,
          jumlah_pemeriksaan: 0,
        };
      }
      result[key].jumlah_pemeriksaan += 1;
    });
  });

  return Object.values(result);
}

export function formatPemeriksaan(data) {
  const result = {};

  // Make sure data is an array
  if (!Array.isArray(data)) {
    return [];
  }

  data.forEach((item) => {
    // Check if required properties exist
    if (!item?.order_lab?.created_at || !item?.tarif_lab?.tarif_lab_item) {
      return;
    }

    // Format date
    const date = new Date(
      parseInt(item.order_lab.created_at) * 1000
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Process each tarif_lab_item
    item.tarif_lab.tarif_lab_item.forEach((p) => {
      // Determine pemeriksaan name
      let pemeriksaanName = null;
      let pemeriksaanCode = null;

      if (p.item_pemeriksaan_uuid && p.item_pemeriksaan) {
        pemeriksaanName = p.item_pemeriksaan.name;
        pemeriksaanCode = p.item_pemeriksaan.code;
      } else if (p.kelompok_pemeriksaan_uuid && p.kelompok_pemeriksaan) {
        pemeriksaanName = p.kelompok_pemeriksaan.name;
        pemeriksaanCode = p.kelompok_pemeriksaan.code;
      }

      // Skip if no valid name found
      if (!pemeriksaanName) return;

      // Create unique key
      const key = `${pemeriksaanCode}-${pemeriksaanName}`;

      // Initialize or increment count
      if (!result[key]) {
        result[key] = {
          nama_pemeriksaan: pemeriksaanName,
          jumlah_pemeriksaan: 0,
        };
      }
      result[key].jumlah_pemeriksaan += 1;
    });
  });

  return Object.values(result);
}
