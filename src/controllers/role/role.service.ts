import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Role } from "./role.model";


@Injectable()
export class RoleService{

    constructor(@InjectModel("Role") private readonly roleModel: Model<Role>){
    }

    async findById(id: String){
        return await this.roleModel.findById(id);
    }

    async findAllEnabledRoles(){
        return await this.roleModel.find({deleted: false}).sort({description: 1});
    }

    async findByQuery(query){
        return await this.roleModel.find(query);
    }

    async create(role: Role){
        return await new this.roleModel(role).save();
    }

    async update(role: Role){
        return await this.roleModel.updateOne({_id: role._id}, role);
    }

}