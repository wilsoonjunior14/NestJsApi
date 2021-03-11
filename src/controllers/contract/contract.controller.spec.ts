import { Test, TestingModule } from '@nestjs/testing';
import { ContractController } from './contract.controller';
import { LogsService } from '../logs/logs.service';
import { UserService } from '../user/user.service';
import { GroupService } from '../group/group.service';
import { ImmobileService } from '../immobile/immobile.service';
import { ContractService } from './contract.service';
import { Utils } from '../../utils/Utils';
import { ContractModule } from './contract.module';
const sinon = require('sinon');

describe('ContractController', () => {
  let controller: ContractController;
  let logService: LogsService;
  let userService: UserService;
  let groupService: GroupService;
  let immobileService: ImmobileService;
  let contractService: ContractService;
  let utils: Utils;

  const MOCKED_REQUEST = {
    headers: {
      authorization: "Bearer abcde"
    }
  };

  const MOCKED_CURRENT_USER = {
    group: ""
  };

  beforeEach(async () => {
    logService = new LogsService(null);
    userService = new UserService(null, null);
    groupService = new GroupService(null);
    immobileService = new ImmobileService(null);
    contractService = new ContractService(null);
    utils = new Utils(logService, userService, groupService);

    controller = new ContractController(logService, userService, groupService, immobileService, contractService);

    sinon.stub(userService, 'getDataByToken').callsFake(() => MOCKED_CURRENT_USER);
    sinon.stub(logService, 'saveLog').callsFake(() => {});
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Contract module is defined', () => {
    expect(new ContractModule()).toBeDefined();
  });

  it("getAll", async() => {
    sinon.stub(contractService, 'findByQuery').callsFake(() => []);

    const results = await controller.getAll(MOCKED_REQUEST);

    expect(results.status).toBe(200);
  });

  it("getById returns 500 when id is null", async () => {
    sinon.stub(contractService, 'findById').rejects(new Error("invalid id"));

    const results = await controller.getById(null, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("getById", async () => {
    sinon.stub(contractService, 'findById').callsFake(() => {});

    const results = await controller.getById(null, MOCKED_REQUEST);

    expect(results.status).toBe(200);
  });

  it("delete returns 500 when user has not permission", async () => {
    whenUserHasNotPermission();

    const results = await controller.delete(null, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("delete returns 500 when id is not found", async () => {
    sinon.stub(contractService, 'findById').rejects(new Error("invalid id"));
    whenUserHasPermission();

    const results = await controller.delete({}, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("delete returns 500 when immobile id is not found", async () => {
    const MOCKED_CONTRACT = {
      _id: "abce"
    };

    sinon.stub(contractService, 'findById').callsFake(() => MOCKED_CONTRACT);
    sinon.stub(immobileService, 'getById').rejects(new Error("invalid id"));
    whenUserHasPermission();

    const results = await controller.delete({}, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("delete", async () => {
    const MOCKED_CONTRACT = {
      _id: "abce"
    };

    const MOCKED_IMMOBILE = {
      contract: null
    };

    sinon.stub(contractService, 'findById').callsFake(() => MOCKED_CONTRACT);
    sinon.stub(immobileService, 'getById').callsFake(() => MOCKED_IMMOBILE);
    sinon.stub(contractService, 'update').callsFake(() => {});
    sinon.stub(immobileService, 'update').callsFake(() => {});
    whenUserHasPermission();

    const results = await controller.delete({}, MOCKED_REQUEST);

    expect(results.status).toBe(200);
  });

  it("create returns 500 when user has not permission", async () => {
    whenUserHasNotPermission();

    const results = await controller.create({}, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when contract is null", async () => {
    whenUserHasPermission();

    const results = await controller.create(null, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when beginDate is not provided", async () => {
    whenUserHasPermission();

    const results = await controller.create({}, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when beginDate has invalid pattern", async () => {
    const MOCKED_CONTRACT = {
      beginDate: "2020-01313-0112341241"
    };

    whenUserHasPermission();

    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when beginDate has invalid format", async () => {
    const MOCKED_CONTRACT = {
      beginDate: "2020-99-91"
    };

    whenUserHasPermission();

    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when endDate is not provided", async () => {
    const MOCKED_CONTRACT = {
      beginDate: "2020-01-01"
    };

    whenUserHasPermission();

    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when endDate has invalid format", async () => {
    const MOCKED_CONTRACT = {
      beginDate: "2020-01-01",
      endDate: "2020-99-99"
    };

    whenUserHasPermission();

    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when endDate has invalid pattern", async () => {
    const MOCKED_CONTRACT = {
      beginDate: "2020-01-01",
      endDate: "2020-99999-99999"
    };

    whenUserHasPermission();

    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when beginDate is bigger than endDate", async () => {
    const MOCKED_CONTRACT = {
      beginDate: "2021-01-01",
      endDate: "2020-12-01"
    };

    whenUserHasPermission();

    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when monthValue is not provided", async () => {

    const MOCKED_CONTRACT = {
      beginDate: "2020-01-01",
      endDate: "2020-12-01"
    };

    whenUserHasPermission();

    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when monthValue is zero", async () => {
    const MOCKED_CONTRACT = {
      beginDate: "2020-01-01",
      endDate: "2020-12-01",
      monthValue: 0.00
    };

    whenUserHasPermission();

    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when monthValue is lower than zero", async () => {
    const MOCKED_CONTRACT = {
      beginDate: "2020-01-01",
      endDate: "2020-12-01",
      monthValue: -120.00
    };

    whenUserHasPermission();

    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when monthValue is a string", async () => {
    const MOCKED_CONTRACT = {
      beginDate: "2020-01-01",
      endDate: "2020-12-01",
      monthValue: "100"
    };

    whenUserHasPermission();

    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when immobile is not provided", async () => {
    const MOCKED_CONTRACT = {
      beginDate: "2020-01-01",
      endDate: "2020-12-01",
      monthValue: 100
    };

    whenUserHasPermission();

    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when immobile _id is not provided", async () => {
    const MOCKED_CONTRACT = {
      beginDate: "2020-01-01",
      endDate: "2020-12-01",
      monthValue: 100,
      immobile: {}
    };

    whenUserHasPermission();

    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when there are many contracts of an immobile", async () => {
    const MOCKED_CONTRACT = {
      beginDate: "2020-01-01",
      endDate: "2020-12-01",
      monthValue: 100,
      immobile: {
        _id: "abceds"
      }
    };

    whenUserHasPermission();
    sinon.stub(contractService, 'findByQuery').callsFake(() => [MOCKED_CONTRACT]);
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create returns 500 when _id immobile does not exists", async () => {
    const MOCKED_CONTRACT = {
      beginDate: "2020-01-01",
      endDate: "2020-12-01",
      monthValue: 100,
      immobile: {
        _id: "abceds"
      }
    };

    const MOCKED_IMMOBILE = {
      contract: null
    };

    whenUserHasPermission();
    sinon.stub(contractService, 'findByQuery').callsFake(() => []);
    sinon.stub(contractService, 'save').callsFake(() => MOCKED_CONTRACT);
    sinon.stub(immobileService, 'getById').rejects(new Error("invalid id"));
    sinon.stub(immobileService, 'update').callsFake(() => MOCKED_IMMOBILE);
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("create", async () => {
    const MOCKED_CONTRACT = {
      beginDate: "2020-01-01",
      endDate: "2020-12-01",
      monthValue: 100,
      immobile: {
        _id: "abceds"
      }
    };

    const MOCKED_IMMOBILE = {
      contract: null
    };

    whenUserHasPermission();
    sinon.stub(contractService, 'findByQuery').callsFake(() => []);
    sinon.stub(contractService, 'save').callsFake(() => MOCKED_CONTRACT);
    sinon.stub(immobileService, 'getById').callsFake(() => MOCKED_IMMOBILE);
    sinon.stub(immobileService, 'update').callsFake(() => MOCKED_IMMOBILE);
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(200);
  });

  it("update returns 500 when user has not permission", async () => {
    whenUserHasNotPermission();

    const results = await controller.update({}, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update returns 500 when contract is null", async () => {
    whenUserHasPermission();

    const results = await controller.update(null, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update returns 500 when contract _id is not provided", async () => {
    whenUserHasPermission();

    const results = await controller.update({}, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update returns 500 when contract begin date is not provided", async () => {
    const MOCKED_CONTRACT = {
      _id: "abced"
    };

    whenUserHasPermission();

    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update returns 500 when begin date has invalid format", async () => {
    const MOCKED_CONTRACT = {
      _id: "abced",
      beginDate: "2020-99-99"
    };

    whenUserHasPermission();

    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update returns 500 when begin date has invalid pattern", async () => {
    const MOCKED_CONTRACT = {
      _id: "abced",
      beginDate: "2020-9903-99"
    };

    whenUserHasPermission();

    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update returns 500 when end date is not provided", async () => {
    const MOCKED_CONTRACT = {
      _id: "abced",
      beginDate: "2020-01-01"
    };

    whenUserHasPermission();

    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update returns 500 when end date has invalid pattern", async () => {
    const MOCKED_CONTRACT = {
      _id: "abced",
      beginDate: "2020-01-01",
      endDate: "2020/01/02"
    };

    whenUserHasPermission();

    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update returns 500 when end date is lower than begin date", async () => {
    const MOCKED_CONTRACT = {
      _id: "abced",
      beginDate: "2020-01-01",
      endDate: "2019-01-01"
    };

    whenUserHasPermission();

    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update returns 500 when monthValue is not provided", async () => {
    const MOCKED_CONTRACT = {
      _id: "abced",
      beginDate: "2020-01-01",
      endDate: "2021-01-01"
    };

    whenUserHasPermission();

    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update returns 500 when monthValue is a string", async () => {
    const MOCKED_CONTRACT = {
      _id: "abced",
      beginDate: "2020-01-01",
      endDate: "2021-01-01",
      monthValue: "100"
    };

    whenUserHasPermission();

    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update returns 500 when monthValue is lower than zero", async () => {
    const MOCKED_CONTRACT = {
      _id: "abced",
      beginDate: "2020-01-01",
      endDate: "2021-01-01",
      monthValue: -100
    };

    whenUserHasPermission();

    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update returns 500 when immobile is not provided", async () => {
    const MOCKED_CONTRACT = {
      _id: "abced",
      beginDate: "2020-01-01",
      endDate: "2021-01-01",
      monthValue: 200
    };

    whenUserHasPermission();

    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update returns 500 when immobile _id is not provided", async () => {
    const MOCKED_CONTRACT = {
      _id: "abced",
      beginDate: "2020-01-01",
      endDate: "2021-01-01",
      monthValue: 200,
      immobile: {}
    };

    whenUserHasPermission();

    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update returns 500 when immobile _id found is different of immobile _id provided", async () => {
    const MOCKED_CONTRACT = {
      _id: "abced",
      beginDate: "2020-01-01",
      endDate: "2021-01-01",
      monthValue: 200,
      immobile: {
        _id: "abced"
      }
    };

    const MOCKED_FOUND_CONTRACT = {
      immobile: {
        _id: "laskjdlaksjdlaksjdl"
      }
    };

    whenUserHasPermission();
    sinon.stub(contractService, 'findById').callsFake(() => MOCKED_FOUND_CONTRACT);
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  it("update", async () => {
    const MOCKED_CONTRACT = {
      _id: "abced",
      beginDate: "2020-01-01",
      endDate: "2021-01-01",
      monthValue: 200,
      immobile: {
        _id: "abced"
      }
    };

    const MOCKED_CONTRACT_FOUND = {
      immobile: "abced"
    };

    whenUserHasPermission();
    sinon.stub(contractService, 'findById').callsFake(() => MOCKED_CONTRACT_FOUND);
    sinon.stub(contractService, 'update').callsFake(() => MOCKED_CONTRACT);
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(200);
  });

  it("update returns 500 when contract _id is not found", async () => {
    const MOCKED_CONTRACT = {
      _id: "abced",
      beginDate: "2020-01-01",
      endDate: "2021-01-01",
      monthValue: 200,
      immobile: {
        _id: "abced"
      }
    };

    whenUserHasPermission();
    sinon.stub(contractService, 'findById').rejects(new Error("invalid id"));
    sinon.stub(contractService, 'update').callsFake(() => MOCKED_CONTRACT);
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    expect(results.status).toBe(500);
  });

  function whenUserHasNotPermission(){
    sinon.stub(groupService, 'hasPermission').callsFake(() => false);
  }

  function whenUserHasPermission(){
    sinon.stub(groupService, 'hasPermission').callsFake(() => true);
  }

});
