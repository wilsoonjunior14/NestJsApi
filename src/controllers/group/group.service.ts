import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Group } from './group.model';

@Injectable()
export class GroupService {

    constructor(@InjectModel('Group') private readonly groupModel: Model<Group>){    
    }

    async create(group: Group) {
        return await new this.groupModel(group).save();
    }

}