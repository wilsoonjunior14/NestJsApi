import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role } from '../../../dist/controllers/role/role.model';
import { RoleModule } from './role.module';
import { LogsService } from '../logs/logs.service';
import { Utils } from '../../utils/Utils';
import { UserService } from '../user/user.service';
import { GroupService } from '../group/group.service';
const sinon = require('sinon');

describe('RoleController', () => {
  let controller: RoleController;
  let service: RoleService;
  let logService: LogsService;
  let userService: UserService;
  let groupService: GroupService;
  let utils: Utils;

  var MOCKED_ROLE = {
    description: "TESTING"
  };

  var REQUEST_MOCKED = {
    headers: {
      authorization: "Bearer abcde"
    }
  };

  const CURRENT_USER_MOCKED = {
    group: ""
  };

  var roleMocked: Role;

  beforeEach(async () => {
    service = new RoleService(null);
    logService = new LogsService(null);
    userService = new UserService(null, null);
    groupService = new GroupService(null);
    utils = new Utils(logService, userService, groupService);
    controller = new RoleController(service, logService, userService, groupService);

    sinon.stub(userService, 'getDataByToken').callsFake(() => CURRENT_USER_MOCKED);
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

    whenFindByIdIsCalled(MOCKED_ROLE);
    const results = await controller.findById(id, REQUEST_MOCKED);

    thenSuccess(results);
  });

  it('findById Returns 500 when invalid id is provided', async () => {
    var id = "";

    whenFindByIdIsCalledWithError();
    const results = await controller.findById(id, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('findAllEnabledRoles', async () => {
    whenFindAllEnabledRolesIsCalled(MOCKED_ROLE);
    var results = await controller.findAllEnabledRoles(REQUEST_MOCKED);

    thenSuccess(results);
  });

  it('createRole returns status 500', async () => {
    givenUserWithPermission();

    var returns = await controller.createRole(roleMocked, REQUEST_MOCKED);

    thenError(returns);
  });

  it('createRole returns 500 when user has not permission', async () => {
    givenUserWithoutPermission();

    var returns = await controller.createRole(roleMocked, REQUEST_MOCKED);

    thenError(returns);
  });

  it('createdRole', async () => {
    givenUserWithPermission();
    
    whenCreateIsCalled(MOCKED_ROLE);
    whenFindByQueryIsCalled();
    var results = await controller.createRole(MOCKED_ROLE, REQUEST_MOCKED);

    thenSuccess(results);
  });

  it('updateRole returns status 500', async () => {
    givenUserWithPermission();
    
    var returns = await controller.updateRole(roleMocked, REQUEST_MOCKED);

    thenError(returns);
  });

  it('updateRole returns 500 when user has not permission', async () => {
    givenUserWithoutPermission();
    
    var returns = await controller.updateRole(roleMocked, REQUEST_MOCKED);

    thenError(returns);
  });

  it('updateRole', async () => {
    givenUserWithPermission();
    const MOCKED_UPDATED_ROLE = Object.assign(MOCKED_ROLE, {_id: "1023lkj1l23"});
    
    whenFindByIdIsCalled(MOCKED_ROLE);
    whenUpdateIsCalled(MOCKED_ROLE);
    whenFindByQueryIsCalled();
    var returns = await controller.updateRole(MOCKED_UPDATED_ROLE, REQUEST_MOCKED);

    expect(returns.status).toBe(200);
  });

  it ('deleteRole returns 500', async () => {
    givenUserWithoutPermission();
    
    var returns = await controller.deleteRole(null, REQUEST_MOCKED);

    thenError(returns);
  });

  it ('deleteRole returns status 500', async () => {
    givenUserWithPermission();
    
    var returns = await controller.deleteRole(null, REQUEST_MOCKED);

    thenError(returns);
  });

  it ('deleteRole', async () => {
    givenUserWithPermission();
    var id = "123123lj123lk1";
    var DELETED_ROLE = Object.assign(MOCKED_ROLE, {deleted: true});
    
    whenFindByIdIsCalled(MOCKED_ROLE);
    whenUpdateIsCalled(DELETED_ROLE);
    var deletedRole = await controller.deleteRole(id, REQUEST_MOCKED);

    thenSuccess(deletedRole);
  });

  it ('deleteRole Returns 500 when id provided is null', async () => {
    givenUserWithPermission();
    var id = "123123lj123lk1";
    
    whenFindByIdIsCalledWithError();
    var deletedRole = await controller.deleteRole(id, REQUEST_MOCKED);

    expect(deletedRole.status).toBe(500);
  });

  function whenUpdateIsCalled(value){
    sinon.stub(service, 'update').callsFake(() => value);
  }

  function whenFindByQueryIsCalled(){
    sinon.stub(service, 'findByQuery').callsFake(() => []);
  }

  function whenCreateIsCalled(value){
    sinon.stub(service, 'create').callsFake(() => value);
  }

  function whenFindAllEnabledRolesIsCalled(values){
    sinon.stub(service, 'findAllEnabledRoles').callsFake(() => [values]);
  }

  function whenFindByIdIsCalledWithError(){
    sinon.stub(service, 'findById').rejects(new Error("id invalid"));
  }

  function whenFindByIdIsCalled(value){
    sinon.stub(service, 'findById').callsFake(() => value);
  }

  function thenSuccess(results){
    expect(results.status).toBe(200);
  }

  function thenError(results){
    expect(results.status).toBe(500);
  }

  function givenUserWithPermission(){
    sinon.stub(groupService, 'hasPermission').callsFake(() => true);
  };

  function givenUserWithoutPermission(){
    sinon.stub(groupService, 'hasPermission').callsFake(() => false);
  };

});
