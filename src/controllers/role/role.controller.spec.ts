import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role } from '../../../dist/controllers/role/role.model';
import { RoleModule } from './role.module';
import { LogsService } from '../logs/logs.service';
import { Utils } from '../../utils/Utils';
import { UserService } from '../user/user.service';
const sinon = require('sinon');

describe('RoleController', () => {
  let controller: RoleController;
  let service: RoleService;
  let logService: LogsService;
  let userService: UserService;
  let utils: Utils;

  var MOCKED_ROLE = {
    description: "TESTING"
  };

  var REQUEST_MOCKED = {
    headers: {
      authorization: "Bearer abcde"
    }
  };

  var roleMocked: Role;

  beforeEach(async () => {
    service = new RoleService(null);
    logService = new LogsService(null);
    userService = new UserService(null, null);
    utils = new Utils(logService, userService);
    controller = new RoleController(service, logService, userService);

    sinon.stub(userService, 'getDataByToken').callsFake(() => {});
    sinon.stub(logService, 'saveLog').callsFake(() => {});
  });

  it('role module is defined', () => {
    const roleModule = new RoleModule();

    expect(roleModule).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findById', async () => {
    var id = "19283012j3k1j2";

    sinon.stub(service, 'findById').callsFake(() => MOCKED_ROLE);
    const results = await controller.findById(id, REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

  it('findById Returns 500 when invalid id is provided', async () => {
    var id = "";

    sinon.stub(service, 'findById').rejects(new Error("id invalid"));
    const results = await controller.findById(id, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('findAllEnabledRoles', async () => {
    sinon.stub(service, 'findAllEnabledRoles').callsFake(() => [MOCKED_ROLE]);
    var results = await controller.findAllEnabledRoles(REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

  it('createRole returns status 500', async () => {
    var returns = await controller.createRole(roleMocked, REQUEST_MOCKED);

    expect(returns.status).toBe(500);
  });

  it('createdRole', async () => {
    sinon.stub(service, 'create').callsFake(() => MOCKED_ROLE);
    sinon.stub(service, 'findByQuery').callsFake(() => []);

    var results = await controller.createRole(MOCKED_ROLE, REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

  it('updateRole returns status 500', async () => {
    var returns = await controller.updateRole(roleMocked, REQUEST_MOCKED);

    expect(returns.status).toBe(500);
  });

  it('updateRole', async () => {
    sinon.stub(service, 'findById').callsFake(() => MOCKED_ROLE);
    sinon.stub(service, 'update').callsFake(() => MOCKED_ROLE);
    sinon.stub(service, 'findByQuery').callsFake(() => []);
    const MOCKED_UPDATED_ROLE = Object.assign(MOCKED_ROLE, {_id: "1023lkj1l23"});

    var returns = await controller.updateRole(MOCKED_UPDATED_ROLE, REQUEST_MOCKED);

    expect(returns.status).toBe(200);
  });

  it ('deleteRole returns status 500', async () => {
    var returns = await controller.deleteRole(null, REQUEST_MOCKED);

    expect(returns.status).toBe(500);
  });

  it ('deleteRole', async () => {
    var id = "123123lj123lk1";
    var DELETED_ROLE = Object.assign(MOCKED_ROLE, {deleted: true});
    
    sinon.stub(service, 'findById').callsFake(() => MOCKED_ROLE);
    sinon.stub(service, 'update').callsFake(() => DELETED_ROLE);
    var deletedRole = await controller.deleteRole(id, REQUEST_MOCKED);

    expect(deletedRole.status).toBe(200);
  });

  it ('deleteRole Returns 500 when id provided is null', async () => {
    var id = "123123lj123lk1";
    
    sinon.stub(service, 'findById').rejects(new Error("id invalid"));
    var deletedRole = await controller.deleteRole(id, REQUEST_MOCKED);

    expect(deletedRole.status).toBe(500);
  });

});
