import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { User } from './user.model';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService { 

    constructor(@InjectModel("User") private readonly userModel: Model<User>,
    private jwtService: JwtService){
    }

    async getAllEnabled(){
        return await this.userModel.find();
    }

    async getById(id: String){
        return await this.userModel.findById(id);
    }

    async save(user: User){
        return await new this.userModel(user).save();
    }

    async update(user: User){
        return await this.userModel.updateOne({_id: user.id}, user);
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
}