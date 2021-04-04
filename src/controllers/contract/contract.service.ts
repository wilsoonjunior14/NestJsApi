import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { Contract } from './contract.model';


@Injectable()
export class ContractService {

    constructor(@InjectModel("Contract") private readonly contractModel : Model<Contract>){

    }

    public async findAll(){
        return await this.contractModel.find();
    }

    public async findByQuery(query: any){

        return await this.contractModel.aggregate([
            {
                "$match": query
            },
            {
                "$lookup": {
                    "localField": "immobile",
                    "from": "immobiles",
                    "foreignField": "_id",
                    "as": "immobile"
                }
            },
            {
                "$lookup": {
                    "localField": "client",
                    "from": "users",
                    "foreignField": "_id",
                    "as": "client"
                }
            }
        ])
    }

    public async findById(_id: String){
        return await this.contractModel.findById(_id);
    }

    public async update(contract: any){
        return await this.contractModel.updateOne({_id: contract._id}, contract);
    }

    public async save(contract: any){
        return await new this.contractModel(contract).save();
    }

}