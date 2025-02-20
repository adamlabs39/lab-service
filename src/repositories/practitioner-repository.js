import { PractitionerModel } from "@adameds/model-sdk/datamaster";

export default class PractitionerRepository{
    static async findbyUuid(uuid, faskes_uuid){
        return await PractitionerModel.findOne({
            where: {
                uuid,
                faskes_uuid,
                deleted_at: {
                    [Op.is]: null
                }
            }
        })
    }
}