export default class SesiRepository{
    static async findbyUUID(uuid){
        return await Sesi.findOne({
            where: {
                uuid
            }
        })
    }
}