import ObservationItemModel from "../../../model-sdk/models/lab/observation-item-model";

ObservationItemModel.belongsTo(ObservationModel, {
    foreignKey: "observation_uuid",
    as: "observation",
    constraints: false
});

export default class ObservationItemRepository {
    static async bulkCreate(data, transaction){
        return await ObservationItemModel.bulkCreate(data, {transaction});
    } 
}