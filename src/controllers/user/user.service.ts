import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { User } from './user.model';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Constants } from '../../utils/Contansts';

@Injectable()
export class UserService { 

    constructor(@InjectModel("User") private readonly userModel: Model<User>,
    private jwtService: JwtService){
    }

    async getAllEnabled(){
        const query = {
            deleted: false
        };
        return await this.getByQuery(query);
    }

    async getByQuery(query){
        return await this.userModel.aggregate([
            {
                "$match": query
            }, 
            {
                "$lookup":
                    {
                        "localField": "group",
                        "from": "groups",
                        "foreignField": "_id",
                        "as": "group"
                    }
            }
        ]);
    }

    async getById(id: String){
        return await this.userModel.findById(id);
    }

    async save(user: User){
        return await new this.userModel(user).save();
    }

    async update(user){
        return await this.userModel.updateOne({_id: user._id}, user);
    }

    async findByQuery(query: any){
        Object.assign(query, {deleted: false});
        return await this.userModel.find(query);
    }

    async getToken(user: any){
        return await this.jwtService.sign(user);
    }

    async checksIfTokenIsValid(token: string){
        const isTokenValid = await this.jwtService.verify(token);
        return isTokenValid.exp > isTokenValid.iat;
    }

    async comparePasswords(password, passwordEncrypted){
        return await bcrypt.compare(password, passwordEncrypted);
    }

    async getDataByToken(token){
        if (!token){
            return {};
        }
        return await this.jwtService.decode(token);
    }
}