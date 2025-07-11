import OrderLabRepository from "../repositories/order-lab-repository.js";

const generateregistrationNumber = async (prefix, faskes_uuid) => {
  if (prefix.length !== 3) {
    throw new Error("Prefix must be 3 characters long");
  }

  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayDate = `${year}${month}${day}`;

  const latestOrder = await OrderLabRepository.findLatest(faskes_uuid);

  let sequence = 1; // Default: 001 jika tidak ada data sebelumnya

  if (latestOrder?.noreg) {
    // Ekstrak tanggal dari nomor registrasi terakhir (setelah prefix)
    const latestOrderDate = latestOrder.noreg.slice(3, 9); // Format: PREFIX(3) + YYMMDD(6)

    if (todayDate === latestOrderDate) {
      // Jika tanggal sama, ambil sequence terakhir + 1
      const lastSequence = parseInt(latestOrder.noreg.slice(-3), 10);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }
    // Jika tanggal berbeda, sequence tetap 1 (reset ke 001)
  }

  const sequenceString = String(sequence).padStart(3, "0");
  const newRegistrationNumber = `${prefix}${todayDate}${sequenceString}`;

  return newRegistrationNumber;
};

export default generateregistrationNumber;
