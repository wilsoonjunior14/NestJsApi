import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { GroupModule } from './group.module';
const sinon = require('sinon');

describe('GroupController', () => {
  let controller: GroupController;
  let service: GroupService;

  var MOCKED_GROUP = {
    description: "ANY DESCRIPTION"
  };

  beforeEach(async () => {
    service = new GroupService(null);
    controller = new GroupController(service);
  });

  it('group module is defined', () => {
    const groupModule = new GroupModule();

    expect(groupModule).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getEnabledGroups', async () => {
    sinon.stub(service, "getEnabledGroups").callsFake(() => [MOCKED_GROUP]);
    var groups = await controller.getEnabledGroups();

    expect(groups).toBeDefined();
    expect(groups.status).toBe(200);
    expect(groups.data.length).toBeTruthy();
  });

  it("getById", async () => {
    var id = "120398102938";

    sinon.stub(service, "getById").callsFake(() => MOCKED_GROUP);
    var response = await controller.getById(id);

    expect(response.status).toBe(200);
    expect(response.data.description).toBe(MOCKED_GROUP.description);    
  });

  it("getById Returns 500", async () => {
    var response = await controller.getById(null);

    expect(response.status).toBe(500);   
  });

  it("createGroup Returns 500", async () => {
    var response = await controller.createGroup(null);

    expect(response.status).toBe(500);
  });

  it("createGroup", async () => {
    sinon.stub(service, 'save').callsFake(() => MOCKED_GROUP);

    var response = await controller.createGroup(MOCKED_GROUP);

    expect(response.status).toBe(200);
  });

  it("updateGroup Returns 500", async () => {
    var response = await controller.updateGroup(null);

    expect(response.status).toBe(500);
  });

  it("updateGroup", async () => {
    sinon.stub(service, 'update').callsFake(() => MOCKED_GROUP);
    sinon.stub(service, 'getById').callsFake(() => MOCKED_GROUP);

    var MOCKED_UPDATED_GROUP = Object.assign(MOCKED_GROUP, {id: "1kjashdkajs"});

    var response = await controller.updateGroup(MOCKED_UPDATED_GROUP);

    expect(response.status).toBe(200);
  });

  it("deleteGroup", async () => {
    var id = "alksdjal";

    sinon.stub(service, "getById").callsFake(() => MOCKED_GROUP);
    sinon.stub(service, "update").callsFake(() => MOCKED_GROUP);
    var response = await controller.deleteGroup(id);

    expect(response.status).toBe(200);
  });

  it("deleteGroup Returns 500", async () => {
    var response = await controller.deleteGroup(null);

    expect(response.status).toBe(500);
  });


});
