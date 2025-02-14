import ObservationItemModel from "../../../model-sdk/models/lab/observation-item-model";

export default class ObservationItemRepository {
    static async create(data){
        return await ObservationItemModel.create(data)
    }
}