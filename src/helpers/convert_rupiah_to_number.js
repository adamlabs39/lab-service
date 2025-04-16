function convertRupiahToNumber(rpString) {
    console.log("rpString", rpString);
    const cleaned = rpString
      .replace(/[^0-9,]/g, '')   // hapus selain angka dan koma
      .replace(',', '.');        // ganti koma jadi titik untuk desimal
  
    return parseFloat(cleaned);
  }
  export default convertRupiahToNumber; 