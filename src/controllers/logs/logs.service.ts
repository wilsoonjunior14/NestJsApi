import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { removeListener } from "node:process";
import { LogsModel } from "./logs.model";


@Injectable()
export class LogsService { 

    constructor(@InjectModel("Logs") private readonly logsModel: Model<LogsModel>){
    }

    public async saveLog(message: String, statusCode: Number, data: any, user: any, request: any){
        const newInstance = {
            message: message,
            data: JSON.stringify(data),
            ip: request.connection.remoteAddress,
            method: JSON.stringify(request.route),
            status: statusCode,
            headers: JSON.stringify(request.headers),
            user: JSON.stringify(user),
        };

        return await new this.logsModel(newInstance).save();
    }

}