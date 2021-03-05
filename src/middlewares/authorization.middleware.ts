import { Injectable, NestMiddleware } from "@nestjs/common";
import { Constants } from '../utils/Contansts';
import { Utils } from '../utils/Utils';
import { UserService } from '../controllers/user/user.service';
import { LogsService } from '../controllers/logs/logs.service';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware{

    private utils: Utils;

    constructor(private readonly userService: UserService,
        private logsService: LogsService){
        this.utils = new Utils(this.logsService, this.userService);
    }

    async use(req: any, res: any, next: () => void) {
        try{
            if (!req.headers.authorization){
                res.json(await this.utils.getInternalServerError(Constants.INVALID_REQUEST_AUTHORIZATION_HEADER_NOT_FOUND, {}, req));
            }
    
            const authorizationHeader = req.headers.authorization;
            const token = this.utils.getsTokenByHeader(authorizationHeader);

            if (!await this.userService.checksIfTokenIsValid(token)){
                res.json(await this.utils.getInternalServerError(Constants.INVALID_REQUEST_AUTHORIZATION_EXPIRED_TOKEN, {}, req));
            }
    
            next();
        } catch(err){
            res.json(await this.utils.getInternalServerError(err.toString(), {}, req));
        }
    }
}