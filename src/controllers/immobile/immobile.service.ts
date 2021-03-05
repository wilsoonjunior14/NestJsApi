import { Injectable } from "@nestjs/common";
import { Model } from 'mongoose';
import { Immobile } from "./immobile.model";
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class ImmobileService {

    constructor(@InjectModel('Immobile') private readonly immobileModel: Model<Immobile>){
    }

    public async getEnabledImmobiles(){
        return await this.immobileModel.aggregate(
            [
                {
                    "$match": {
                        "deleted": false
                    }
                },
                this.getUserJoinCondition(),
                this.getLocalizationJoinCondition(),
                this.getClientJoinCondition()
            ]
        );
    }

    public async getById(id: String){
        return await this.immobileModel.findById(id);
    }

    public async create(immobile){
        return await new this.immobileModel(immobile).save();
    }

    public async update(immobile){
        return await this.immobileModel.updateOne({_id: immobile._id}, immobile);
    }

    private getUserJoinCondition(){
        return {
            "$lookup": {
                "localField": "user",
                "from": "users",
                "foreignField": "_id",
                "as": "user"
            }
        };
    }

    private getClientJoinCondition(){
        return {
            "$lookup": {
                "localField": "client",
                "from": "users",
                "foreignField": "_id",
                "as": "client"
            }
        };
    }
    
    private getLocalizationJoinCondition(){
        return {
            "$lookup": {
                "localField": "localization",
                "from": "localizations",
                "foreignField": "_id",
                "as": "localization"
            }
        };
    }

}