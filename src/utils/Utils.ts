import { Constants } from './Contansts';
import * as bcrypt from 'bcrypt';
import { LogsService } from '../controllers/logs/logs.service';
import { UserService } from '../controllers/user/user.service';

export class Utils {

    constructor(private logsService: LogsService,
        private userService: UserService){
    }

    async getInternalServerError(message: String, data: any, request: any){
        return await this.getAPIResponse(message, 500, data, request);        
    }

    async getResponse(message: String, data: any, request: any){
        return await this.getAPIResponse(message, 200, data, request);
    }

    async getAPIResponse(message: String, statusCode: Number, data: any, request: any){
        if (request.headers.authorization){
            const currentUser = await this.userService.getDataByToken(await this.getsTokenByHeader(request.headers.authorization));
            await this.logsService.saveLog(message, statusCode, data, currentUser, request);
        }

        return {
            status: statusCode,
            message: message,
            data: data
        };
    }

    /**
     * Gets a single message unified.
     * 
     * @param field Field that errors occurred.
     * @param messages List of error messages.
     * @returns Object that contains all messages joined.
     */
    buildMessage(field: String, ...messages: Array<String>){
        let unifiedMessages = messages.join("\n");
        return field + Constants.INVALID_COMMON_MESSAGE + "\n" + unifiedMessages;
    }

    /**
     * Generates a new password to be hashed.
     * 
     * @param password Password to be hashed.
     * @returns String recently hashed.
     */
    async getsNewPassword(password: String){
        return await bcrypt.hash(password, 10); 
    }

    getsTokenByHeader(header){
        if (!header){
            return;
        }
        return header.split("Bearer ")[1];
    }

    getRandomNumber() : String{
        let code = "";
        for (var i=0; i<4; i++){
            code = code + "" + Math.round(Math.random()*10);
        }

        return code;
    }

}