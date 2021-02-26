import { Constants } from './Contansts';
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

}