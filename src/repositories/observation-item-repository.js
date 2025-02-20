

// ObservationItemModel.belongsTo(ObservationModel, {
//     foreignKey: "observation_uuid",
//     as: "observation",
//     constraints: false
// });

import { ObservationItemModel } from "@adameds/model-sdk/lab";

export default class ObservationItemRepository {
    static async bulkCreate(data, transaction){
        return await ObservationItemModel.bulkCreate(data, {transaction});
    } 
}