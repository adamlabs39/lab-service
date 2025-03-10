const formatPemeriksaan = (data) => {
    const result = {}
    // return data
    data.forEach((item) => {
        const date = new Date(parseInt(item.order_lab.created_at) * 1000)
                        .toLocaleDateString("id-ID",{day: "2-digit", month: "2-digit", year: "numeric"})

        const itemName = item.item_pemeriksaan.name

        const key = `${date}-${itemName}`

        if(!result[key]){
            result[key] = {
                tanggal: date,
                nama_item: itemName,
                jumlah_pemeriksaan: 0
            }
        }
        result[key].jumlah_pemeriksaan += 1
        
    })
    return Object.values(result)
}

export default formatPemeriksaan;