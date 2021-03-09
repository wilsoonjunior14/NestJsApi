import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { GroupModule } from './group.module';
import { LogsService } from '../logs/logs.service';
import { UserService } from '../user/user.service';
import { Utils } from '../../utils/Utils';
const sinon = require('sinon');

describe('GroupController', () => {
  let controller: GroupController;
  let service: GroupService;
  let logService: LogsService;
  let userService: UserService;
  let utils: Utils;

  var MOCKED_GROUP = {
    description: "ANY DESCRIPTION"
  };

  var REQUEST_MOCKED = {
    headers: {
      authorization: "Bearer abcde"
    }
  };

  var MOCKED_CURRENT_USER = {
    group: ""
  };

  beforeEach(async () => {
    service = new GroupService(null);
    logService = new LogsService(null);
    userService = new UserService(null, null);
    utils = new Utils(logService, userService, service);
    controller = new GroupController(service, logService, userService);

    sinon.stub(userService, 'getDataByToken').callsFake(() => MOCKED_CURRENT_USER);
    sinon.stub(logService, 'saveLog').callsFake(() => {});
  });

  it('group module is defined', () => {
    const groupModule = new GroupModule();

    expect(groupModule).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getEnabledGroups', async () => {
    givenUserWithPermission();
    sinon.stub(service, "getEnabledGroups").callsFake(() => [MOCKED_GROUP]);
    var groups = await controller.getEnabledGroups(REQUEST_MOCKED);

    expect(groups).toBeDefined();
    expect(groups.status).toBe(200);
    expect(groups.data.length).toBeTruthy();
  });

  it("getById", async () => {
    givenUserWithPermission();
    var id = "120398102938";

    sinon.stub(service, "getById").callsFake(() => MOCKED_GROUP);
    var response = await controller.getById(id, REQUEST_MOCKED);

    expect(response.status).toBe(200);
    expect(response.data.description).toBe(MOCKED_GROUP.description);    
  });

  it("getById Returns 500", async () => {
    givenUserWithPermission();
    var response = await controller.getById(null, REQUEST_MOCKED);

    expect(response.status).toBe(500);   
  });

  it("createGroup Returns 500", async () => {
    givenUserWithPermission();
    var response = await controller.createGroup(null, REQUEST_MOCKED);

    expect(response.status).toBe(500);
  });

  it("createGroup Returns 500 when user has not permission", async () => {
    givenUserWithoutPermission();
    var response = await controller.createGroup(null, REQUEST_MOCKED);

    expect(response.status).toBe(500);
  });

  it("createGroup", async () => {
    givenUserWithPermission();
    sinon.stub(service, 'save').callsFake(() => MOCKED_GROUP);
    sinon.stub(service, 'findByQuery').callsFake(() => []);

    var response = await controller.createGroup(MOCKED_GROUP, REQUEST_MOCKED);

    expect(response.status).toBe(200);
  });

  it("updateGroup Returns 500 when data provided is null", async () => {
    sinon.stub(service, 'hasPermission').callsFake(() => true);
    var response = await controller.updateGroup(null, REQUEST_MOCKED);

    expect(response.status).toBe(500);
  });

  it("updateGroup Returns 500 when user has not permission", async () => {
    givenUserWithoutPermission();
    var response = await controller.updateGroup(null, REQUEST_MOCKED);

    expect(response.status).toBe(500);
  });

  it("updateGroup", async () => {
    sinon.stub(service, 'update').callsFake(() => MOCKED_GROUP);
    sinon.stub(service, 'getById').callsFake(() => MOCKED_GROUP);
    sinon.stub(service, 'findByQuery').callsFake(() => []);
    sinon.stub(service, 'hasPermission').callsFake(() => true);

    var MOCKED_UPDATED_GROUP = Object.assign(MOCKED_GROUP, {_id: "1kjashdkajs"});

    var response = await controller.updateGroup(MOCKED_UPDATED_GROUP, REQUEST_MOCKED);

    expect(response.status).toBe(200);
  });

  it("deleteGroup", async () => {
    var id = "alksdjal";
    givenUserWithPermission();
  
    sinon.stub(service, "getById").callsFake(() => MOCKED_GROUP);
    sinon.stub(service, "update").callsFake(() => MOCKED_GROUP);
    var response = await controller.deleteGroup(id, REQUEST_MOCKED);

    expect(response.status).toBe(200);
  });

  it("deleteGroup Returns 500 when null id is provided", async () => {
    givenUserWithPermission();
    var response = await controller.deleteGroup(null, REQUEST_MOCKED);

    expect(response.status).toBe(500);
  });

  it("deleteGroup Returns 500 when user that performing this action has not permission", async () => {
    givenUserWithoutPermission();
    var response = await controller.deleteGroup(null, REQUEST_MOCKED);

    expect(response.status).toBe(500);
  });

  it("insertRoleIntoGroup Returns 500 when user has not permission", async() => {
    givenUserWithoutPermission();

    const results = await controller.insertRoleIntoGroup({}, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it("insertRoleIntoGroup Returns 500 when _id is not provided", async() => {
    givenUserWithPermission();

    const results = await controller.insertRoleIntoGroup({}, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it("insertRoleIntoGroup Returns 500 when roles is not provided", async() => {
    givenUserWithPermission();
    const group = {
      _id: "asdlkjasl"
    };

    const results = await controller.insertRoleIntoGroup(group, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it("insertRoleIntoGroup", async() => {
    givenUserWithPermission();
    const group = {
      _id: "asdlkjasl",
      roles: [
        {_id: "laksjdla"}
      ]
    };
    sinon.stub(service, 'update').callsFake(() => group);
    sinon.stub(service, 'getById').callsFake(() => group);

    const results = await controller.insertRoleIntoGroup(group, REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

  function givenUserWithPermission(){
    sinon.stub(service, 'hasPermission').callsFake(() => true);
  };

  function givenUserWithoutPermission(){
    sinon.stub(service, 'hasPermission').callsFake(() => false);
  };


});
