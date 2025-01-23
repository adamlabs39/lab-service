import NotfoundException from "../exception/notfound-exception.js";
import SpesimenRepository from "../repositories/spesimen-repository.js";
import SpesimenValidation from "../validations/spesimen-validation.js";
import ZodValidator from "../validations/zod-validator.js";

export default class SpesimenSevice {
     static async create(req){
        const validData = ZodValidator.validate(SpesimenValidation.CREATE, req)
        return await SpesimenRepository.create(validData)
     }

     static async update(uuid, req){
        const isSpesimenExist = await SpesimenRepository.findByUuid(uuid)

        if(!isSpesimenExist){
            throw new NotfoundException("Spesimen not found")
        }

        const validData = ZodValidator.validate(SpesimenValidation.CREATE, req)
        return await SpesimenRepository.update(uuid, req)
     }

     static async delete(uuid){
        const isSpesimentExist = await SpesimenRepository.findByUuid(uuid)

        if(!isSpesimentExist){
            throw new NotfoundException("Spesimen not found")
        }

        return await SpesimenRepository.delete(uuid)
     }

     static async show(uuid){
        const spesimen  = await SpesimenRepository.findByUuid(uuid)

        if(!spesimen){
            throw new NotfoundException("Spesimen not found")
        }
     }

     static async getAll(req){
        return await SpesimenRepository.findAll(req)
     }
}