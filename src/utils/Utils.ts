import { Constants } from './Contansts';
import * as bcrypt from 'bcrypt';
export class Utils {

    /**
     * Gets a failure object message.
     * 
     * @param message Error message.
     * @param data Any object or array.
     * @returns any Object for request.
     */
    getFailureMessage(message: String, data: any) : any{
        return {
            status: 500,
            message: message,
            data: data
        };
    }

    /**
     * Gets a success object message.
     * 
     * @param message Success message.
     * @param data Any Object for request.
     * @returns Object that contains success information.
     */
    getSuccessMessage(message: String, data: any) : any{
        return {
            status: 200,
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