import { Test, TestingModule } from '@nestjs/testing';
import { ContractController } from './contract.controller';
import { LogsService } from '../logs/logs.service';
import { UserService } from '../user/user.service';
import { GroupService } from '../group/group.service';
import { ImmobileService } from '../immobile/immobile.service';
import { ContractService } from './contract.service';
import { Utils } from '../../utils/Utils';
import { ContractModule } from './contract.module';
import { Immobile } from '../immobile/immobile.model';
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

  var MOCKED_CONTRACT = {};

  var MOCKED_IMMOBILE = {};

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
    whenFindByQueryContractIsCalled([]);
    const results = await controller.getAll(MOCKED_REQUEST);

    thenSuccess(results);
  });

  it("getById returns 500 when id is null", async () => {
    whenFindByIdContractIsCalledWithError();
    const results = await controller.getById(null, MOCKED_REQUEST);

    thenError(results);
  });

  it("getById", async () => {
    whenFindByIdContractIsCalled({});
    const results = await controller.getById(null, MOCKED_REQUEST);

    thenSuccess(results);
  });

  it("delete returns 500 when user has not permission", async () => {
    whenUserHasNotPermission();
    const results = await controller.delete(null, MOCKED_REQUEST);

    thenError(results);
  });

  it("delete returns 500 when id is not found", async () => {
    whenFindByIdContractIsCalledWithError();
    whenUserHasPermission();
    const results = await controller.delete({}, MOCKED_REQUEST);

    thenError(results);
  });

  it("delete returns 500 when immobile id is not found", async () => {
    givenSingleContractWithOnly_Id();

    whenFindByIdContractIsCalled(MOCKED_CONTRACT);
    whenGetByIdImmobileIsCalledWithError();
    whenUserHasPermission();
    const results = await controller.delete({}, MOCKED_REQUEST);

    thenError(results);
  });

  it("delete", async () => {
    givenSingleContractWithOnly_Id();
    givenSingleImmobile();

    whenFindByIdContractIsCalled(MOCKED_CONTRACT);
    whenGetByIdImmobileIsCalled(MOCKED_IMMOBILE);
    whenUpdateContractIsCalled({});
    whenUpdateImmobileIsCalled({});
    whenUserHasPermission();
    const results = await controller.delete({}, MOCKED_REQUEST);

    thenSuccess(results);
  });

  it("create returns 500 when user has not permission", async () => {
    whenUserHasNotPermission();

    const results = await controller.create({}, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when contract is null", async () => {
    whenUserHasPermission();

    const results = await controller.create(null, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when beginDate is not provided", async () => {
    whenUserHasPermission();

    const results = await controller.create({}, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when beginDate has invalid pattern", async () => {
    givenContractWithOnlyBeginDate();

    whenUserHasPermission();

    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when beginDate has invalid format", async () => {
    givenContractWithInvalidBeginDate();

    whenUserHasPermission();
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when endDate is not provided", async () => {
    givenContractWithOnlyValidBeginDate();

    whenUserHasPermission();
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when endDate has invalid format", async () => {
    givenContractWithBeginDateAndInvalidEndDate();

    whenUserHasPermission();
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when endDate has invalid pattern", async () => {
    givenContractWithBeginDateAndEndDateWithInvalidPattern();

    whenUserHasPermission();
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when beginDate is bigger than endDate", async () => {
    givenContractWithBeginDateBiggerThanEndDate();

    whenUserHasPermission();
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when monthValue is not provided", async () => {
    givenContractWithoutMonthValue();
    
    whenUserHasPermission();
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when monthValue is zero", async () => {
    givenContractWithZeroMonthValue();

    whenUserHasPermission();
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when monthValue is lower than zero", async () => {
    givenContractWithMonthValueLowerThanZero();

    whenUserHasPermission();
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when monthValue is a string", async () => {
    givenContractWithMonthValueBeingAString();

    whenUserHasPermission();
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when immobile is not provided", async () => {
    givenContractWithoutImmobile();

    whenUserHasPermission();
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when immobile _id is not provided", async () => {
    givenContractWithoutImmobileId();

    whenUserHasPermission();
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when there are many contracts of an immobile", async () => {
    givenContractValid();

    whenUserHasPermission();
    whenFindByQueryContractIsCalled([MOCKED_CONTRACT]);
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("create returns 500 when _id immobile does not exists", async () => {
    givenContractValid();
    givenSingleImmobile();

    whenUserHasPermission();
    whenFindByQueryContractIsCalled([]);
    whenSaveContractIsCalled(MOCKED_CONTRACT);
    whenGetByIdImmobileIsCalledWithError();
    whenUpdateImmobileIsCalled(MOCKED_IMMOBILE);
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("create", async () => {
    givenContractValid();
    givenSingleImmobile();

    whenUserHasPermission();
    whenFindByQueryContractIsCalled([]);
    whenSaveContractIsCalled(MOCKED_CONTRACT);
    whenSaveImmobileIsCalled(MOCKED_IMMOBILE);
    whenGetByIdImmobileIsCalled(MOCKED_IMMOBILE);
    const results = await controller.create(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenSuccess(results);
  });

  it("update returns 500 when user has not permission", async () => {
    whenUserHasNotPermission();

    const results = await controller.update({}, MOCKED_REQUEST);

    thenError(results);
  });

  it("update returns 500 when contract is null", async () => {
    whenUserHasPermission();

    const results = await controller.update(null, MOCKED_REQUEST);

    thenError(results);
  });

  it("update returns 500 when contract _id is not provided", async () => {
    whenUserHasPermission();

    const results = await controller.update({}, MOCKED_REQUEST);

    thenError(results);
  });

  it("update returns 500 when contract begin date is not provided", async () => {
    givenSingleContractWithOnly_Id();

    whenUserHasPermission();
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("update returns 500 when begin date has invalid format", async () => {
    givenContractWithInvalidBeginDate();

    whenUserHasPermission();
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("update returns 500 when begin date has invalid pattern", async () => {
    givenContractWithInvalidBeginDate();

    whenUserHasPermission();
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("update returns 500 when end date is not provided", async () => {
    givenContractWithOnlyValidBeginDate();

    whenUserHasPermission();
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("update returns 500 when end date has invalid pattern", async () => {
    givenContractWithBeginDateAndInvalidEndDate();

    whenUserHasPermission();
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("update returns 500 when end date is lower than begin date", async () => {
    givenContractWithBeginDateBiggerThanEndDate();

    whenUserHasPermission();
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("update returns 500 when monthValue is not provided", async () => {
    givenContractWithoutMonthValue();

    whenUserHasPermission();
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("update returns 500 when monthValue is a string", async () => {
    givenContractWithMonthValueBeingAString();

    whenUserHasPermission();
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("update returns 500 when monthValue is lower than zero", async () => {
    givenContractWithMonthValueLowerThanZero();

    whenUserHasPermission();
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("update returns 500 when immobile is not provided", async () => {
    givenContractWithoutImmobile();

    whenUserHasPermission();
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("update returns 500 when immobile _id is not provided", async () => {
    givenContractWithoutImmobileId();

    whenUserHasPermission();
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("update returns 500 when immobile _id found is different of immobile _id provided", async () => {
    givenContractValid();

    const MOCKED_FOUND_CONTRACT = {
      immobile: {
        _id: "laskjdlaksjdlaksjdl"
      }
    };

    whenUserHasPermission();
    whenFindByIdContractIsCalled(MOCKED_FOUND_CONTRACT);
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  it("update", async () => {
    givenContractValid();

    const MOCKED_CONTRACT_FOUND = {
      immobile: MOCKED_CONTRACT["immobile"]["_id"]
    };

    whenUserHasPermission();
    whenFindByIdContractIsCalled(MOCKED_CONTRACT_FOUND);
    whenUpdateContractIsCalled({});
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenSuccess(results);
  });

  it("update returns 500 when contract _id is not found", async () => {
    givenContractValid();

    whenUserHasPermission();
    whenFindByIdContractIsCalledWithError();
    whenUpdateContractIsCalled({});
    const results = await controller.update(MOCKED_CONTRACT, MOCKED_REQUEST);

    thenError(results);
  });

  function whenSaveImmobileIsCalled(value){
    sinon.stub(immobileService, 'update').callsFake(() => value);
  }

  function whenUserHasNotPermission(){
    sinon.stub(groupService, 'hasPermission').callsFake(() => false);
  }

  function whenUserHasPermission(){
    sinon.stub(groupService, 'hasPermission').callsFake(() => true);
  }

  function whenFindByQueryContractIsCalled(value: any[]){
    sinon.stub(contractService, 'findByQuery').callsFake(() => value);
  }

  function thenSuccess(results: any){
    expect(results.status).toBe(200);
  }

  function thenError(results: any){
    expect(results.status).toBe(500);
  }

  function whenSaveContractIsCalled(value: any){
    sinon.stub(contractService, 'save').callsFake(() => value);
  }

  function whenFindByIdContractIsCalledWithError() : void {
    sinon.stub(contractService, 'findById').rejects(new Error("invalid id"));
  }

  function whenFindByIdContractIsCalled(value: any) : void {
    sinon.stub(contractService, 'findById').callsFake(() => value);
  }

  function whenGetByIdImmobileIsCalledWithError() {
    sinon.stub(immobileService, 'getById').rejects(new Error("invalid id"));
  };

  function givenSingleContractWithOnly_Id(){
    MOCKED_CONTRACT = {
      _id: "abce"
    };
  };

  function whenGetByIdImmobileIsCalled(value: any) {
    sinon.stub(immobileService, 'getById').callsFake(() => value);
  }

  function whenUpdateContractIsCalled(value: any){
    sinon.stub(contractService, 'update').callsFake(() => value);
  }

  function whenUpdateImmobileIsCalled(value: any){
    sinon.stub(immobileService, 'update').callsFake(() => {});
  }

  function givenSingleImmobile() {
    MOCKED_IMMOBILE = {
      contract: null
    };
  };

  function givenContractWithOnlyBeginDate(){
    MOCKED_CONTRACT = {
      _id: "aslkdjal",
      beginDate: "2020-01313-0112341241"
    };
  }

  function givenContractWithInvalidBeginDate(){
    MOCKED_CONTRACT = {
      _id: "abcedsd",
      beginDate: "2020-99-91"
    };
  }

  function givenContractWithOnlyValidBeginDate(){
    MOCKED_CONTRACT = {
      beginDate: "2020-01-01"
    };
  };

  function givenContractWithBeginDateAndInvalidEndDate(){
    MOCKED_CONTRACT = {
      beginDate: "2020-01-01",
      endDate: "2020-99-99"
    };
  }

  function givenContractWithBeginDateAndEndDateWithInvalidPattern(){
    MOCKED_CONTRACT = {
      beginDate: "2020-01-01",
      endDate: "2020-99999-99999"
    };
  }

  function givenContractWithBeginDateBiggerThanEndDate(){
    MOCKED_CONTRACT = {
      _id: "assda",
      beginDate: "2021-01-01",
      endDate: "2020-12-01"
    };
  }

  function givenContractWithoutMonthValue(){
    MOCKED_CONTRACT = {
      _id: "aslkdj",
      beginDate: "2020-01-01",
      endDate: "2020-12-01"
    };
  }

  function givenContractWithZeroMonthValue(){
    MOCKED_CONTRACT = {
      _id: "asjk",
      beginDate: "2020-01-01",
      endDate: "2020-12-01",
      monthValue: 0.00
    };
  }

  function givenContractWithMonthValueLowerThanZero(){
    MOCKED_CONTRACT = {
      _id: "aslkjd",
      beginDate: "2020-01-01",
      endDate: "2020-12-01",
      monthValue: -120.00
    };
  }

  function givenContractWithMonthValueBeingAString(){
    MOCKED_CONTRACT = {
      _id: "aslkdj",
      beginDate: "2020-01-01",
      endDate: "2020-12-01",
      monthValue: "100"
    };
  }

  function givenContractWithoutImmobile(){
    MOCKED_CONTRACT = {
      _id: "asldkj",
      beginDate: "2020-01-01",
      endDate: "2020-12-01",
      monthValue: 100
    };
  }

  function givenContractWithoutImmobileId(){
    MOCKED_CONTRACT = {
      beginDate: "2020-01-01",
      endDate: "2020-12-01",
      monthValue: 100,
      immobile: {}
    };
  }

  function givenContractValid(){
    MOCKED_CONTRACT = {
      _id: "alskdj",
      beginDate: "2020-01-01",
      endDate: "2020-12-01",
      monthValue: 100,
      immobile: {
        _id: "abceds"
      }
    };
  }

});
