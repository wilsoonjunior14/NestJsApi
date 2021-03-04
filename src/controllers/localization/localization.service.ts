import { Injectable } from "@nestjs/common";
import { Model } from 'mongoose';
import { Localization } from "./localization.model";
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class LocalizationService {

    constructor(@InjectModel("Localization") private readonly localizationModel: Model<Localization>){
    }

    public async create(localization: Localization){
        return await new this.localizationModel(localization).save();
    }

    public async getById(id: String){
        return await this.localizationModel.findById(id);
    }

    public async update(localization: Localization){
        return await this.localizationModel.updateOne({_id: localization._id}, localization);
    }
}