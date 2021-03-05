import { Injectable, NestMiddleware } from "@nestjs/common";
import { Constants } from '../utils/Contansts';
import { Utils } from '../utils/Utils';
import { UserService } from '../controllers/user/user.service';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware{

    private utils: Utils;

    constructor(private readonly userService: UserService){
        this.utils = new Utils();
    }

    async use(req: any, res: any, next: () => void) {
        try{
            if (!req.headers.authorization){
                res.json(this.utils.getFailureMessage(Constants.INVALID_REQUEST_AUTHORIZATION_HEADER_NOT_FOUND,{}));
            }
    
            const authorizationHeader = req.headers.authorization;
            const token = this.utils.getsTokenByHeader(authorizationHeader);

            if (!await this.userService.checksIfTokenIsValid(token)){
                res.json(this.utils.getFailureMessage(Constants.INVALID_REQUEST_AUTHORIZATION_EXPIRED_TOKEN, {}));
            }
    
            next();
        } catch(err){
            res.json(this.utils.getFailureMessage(err.toString(), {}));
        }
    }
}