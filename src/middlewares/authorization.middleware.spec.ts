import { AuthorizationMiddleware } from './authorization.middleware';
import { UserService } from '../controllers/user/user.service';
import { GroupService } from '../controllers/group/group.service';
import { Utils } from '../utils/Utils';
import { LogsService } from '../controllers/logs/logs.service';

const sinon = require('sinon');

describe("AuthorizationMiddleware", () => {
    let middleware : AuthorizationMiddleware;
    let userService : UserService;
    let logService : LogsService;
    let utils : Utils;
    let groupService : GroupService;

    let request = {
        headers: {}
    };

    let response = {
        json: function(obj){
            return obj;
        }
    }

    beforeEach(() => {
        userService = new UserService(null, null);
        logService = new LogsService(null);
        groupService = new GroupService(null);
        utils = new Utils(logService, userService, groupService);
        middleware = new AuthorizationMiddleware(userService, logService, groupService);
    });

    it("AuthorizationMiddleware is defined", () => {
        expect(middleware).toBeDefined();
    });

    it("use", async () => {
        let responseMocked = sinon.stub(response, 'json').callsFake();

        await middleware.use(request, response, null);

        expect(responseMocked.callCount > 0).toBeTruthy();
    });

});