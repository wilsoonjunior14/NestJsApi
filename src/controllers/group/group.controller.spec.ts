import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
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

  it("updateGroup Returns 500", async () => {
    var response = await controller.updateGroup(null);

    expect(response.status).toBe(500);
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
