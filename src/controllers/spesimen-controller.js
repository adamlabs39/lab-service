import { SpesimenModel } from "@adameds/model-sdk/lab"
import successResponse from "../response/success-response.js"
import SpesimenSevice from "../services/spesimen-service.js"
import validateExcel from "../helpers/validator-excel.js"
import deletefile from "../helpers/file.js"

export default class SpesimenController{
    static async create(req, res, next){
        try {
            req.body.faskes_uuid = req.author.faskesUuid
            await SpesimenSevice.create(req.body)
            return res.status(201).json(successResponse("Spesimen created"))
        } catch (error) {
            next(error)
        }
    }

    static async update(req,res,next){
        try {
            req.body.faskes_uuid = req.author.faskesUuid
            const uuid = req.params.uuid
            await SpesimenSevice.update(uuid,req.body)
            return res.status(200).json(successResponse("Spesimen updated"))
        } catch (error) {
            next(error)
        }
    }

    static async delete(req,res,next){
        try {
            const uuid = req.params.uuid
            await SpesimenSevice.delete(uuid)
            return res.status(200).json(successResponse("Spesimen deleted"))
        } catch (error) {
            next(error)
        }
    }

    static async show(req,res,next){
        try {
            const uuid = req.params.uuid
            const spesimen = await SpesimenSevice.show(uuid)
            return res.status(200).json(successResponse("Succes get detail spesimen",spesimen))
        } catch (error) {
            next(error)
        }
    }

    static async getAll(req,res,next){
        try {
            req.body.name = req.query.name
            req.body.page = req.query.name
            req.body.limit = req.query.name
            req.body.faskes_uuid = req.author.faskesUuid

            const categoryPemeriksaans = await SpesimenSevice.getAll(req.body)
            return res.status(200).json(successResponse("Success get al data spesimen", categoryPemeriksaans))
        } catch (error) {
            next(error)
        }
    }

    static async import(req,res,next){
        try {
            validateExcel(req.file)
            await SpesimenSevice.import(req.file.path)
            deletefile(req.file.path)
            return res.status(201).json(successResponse("Success import data spesimen"))
        } catch (error) {
            next(error)
        }
    }
}