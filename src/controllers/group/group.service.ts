import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Group } from './group.model';
import { ObjectId } from "mongodb";

@Injectable()
export class GroupService {

    constructor(@InjectModel('Group') private readonly groupModel: Model<Group>){    
    }

    async getById(id: String){
        return await this.groupModel.findById(id);
    }

    async getEnabledGroups(){
        return await this.groupModel.aggregate([
            {
                "$match": {
                    "deleted": false
                }
            },
            {
                "$lookup": 
                    {
                        "localField": "roles",
                        "from": "roles",
                        "foreignField": "_id",
                        "as": "roles"
                    }
            }
        ]);
    }

    async findByQuery(query: any){
        return await this.groupModel.find(query);
    }

    async getAll(){
        return await this.groupModel.find({deleted: false});
    }

    async save(group: Group) {
        return await new this.groupModel(group).save();
    }

    async update(oldId: String, group: Group) {
        return await this.groupModel.updateOne({_id: oldId}, group);
    }

    async hasPermission(groupId, role) : Promise<boolean> {
        const allGroups = await this.getEnabledGroups();
        const foundedGroups = allGroups.filter((groupItem) => {return groupItem._id.toString() === groupId});

        if (foundedGroups.length === 0){
            return false;
        }

        const foundGroup = foundedGroups[0];

        return foundGroup.description === "ADMIN" || foundGroup.roles.some((roleItem) => {
            return roleItem.description === role;
        });
    }

}