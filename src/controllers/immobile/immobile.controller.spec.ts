import { Test, TestingModule } from '@nestjs/testing';
import { ImmobileController } from './immobile.controller';
import { UserService } from '../user/user.service';
import { LocalizationService } from '../localization/localization.service';
import { ImmobileService } from './immobile.service';
import { ImmobileModule } from './immobile.module';
import { LogsService } from '../logs/logs.service';
import { Utils } from '../../utils/Utils';
import { GroupService } from '../group/group.service';
import { Group } from '../../../dist/controllers/group/group.model';
const sinon = require('sinon');

describe('ImmobileController', () => {
  let controller: ImmobileController;
  let immobileService: ImmobileService;
  let userService: UserService;
  let logService: LogsService;
  let groupService: GroupService;
  let utils: Utils;
  let localizationService: LocalizationService;

  let MOCKED_IMMOBILE: any  = {};

  var REQUEST_MOCKED = {
    headers: {
      authorization: "Bearer abcde"
    }
  };

  var CURRENT_USER_MOCKED = {
    group: ""
  };

  beforeEach(async () => {
    userService = new UserService(null, null);
    localizationService = new LocalizationService(null);
    logService = new LogsService(null);
    userService = new UserService(null, null);
    groupService = new GroupService(null);
    utils = new Utils(logService, userService, groupService);
    immobileService = new ImmobileService(null);

    controller = new ImmobileController(immobileService, localizationService, userService, logService, groupService);
    sinon.stub(userService, 'getDataByToken').callsFake(() => CURRENT_USER_MOCKED);
    sinon.stub(logService, 'saveLog').callsFake(() => {});
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Immobile Module is defined', () => {
    expect(new ImmobileModule()).toBeDefined();
  });

  it('getAll', async () => {
    sinon.stub(immobileService, 'getEnabledImmobiles').callsFake(() => []);

    const results = await controller.getAll(REQUEST_MOCKED);

    expect(results.status).toBe(200);
    expect(results.data.length).toBe(0);
  });

  it('getById', async () => {
    sinon.stub(immobileService, 'getById').callsFake(() => [MOCKED_IMMOBILE]);

    const results = await controller.getById("a,msdba", REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

  it('getById Returns 500 when id is null', async () => {
    sinon.stub(immobileService, 'getById').rejects(new Error("invalid id"));

    const results = await controller.getById(null, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('delete Returns 500 when id provided is null', async () => {
    givenUserWithPermission();
    sinon.stub(immobileService, 'getById').rejects(new Error("invalid id"));

    const results = await controller.delete(null, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('delete Returns 500 when id has empty spaces on your building', async () => {
    givenUserWithPermission();
    const _id = "    ";

    const results = await controller.delete(_id, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('delete', async () => {
    givenUserWithPermission();
    const _id = "asldhalskdal";

    sinon.stub(immobileService, 'getById').callsFake(() => MOCKED_IMMOBILE);
    sinon.stub(immobileService, 'update').callsFake(() => {});
    const results = await controller.delete(_id, REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

  it('create Returns 500 when name of immobile is not provided', async () => {
    givenUserWithPermission();
    const immobileToBeCreated = givenImmobileWithoutName();

    const results = await controller.create(immobileToBeCreated, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when user of immobile is not provided', async () => {
    givenUserWithPermission();
    const immobileToBeCreated = givenImmobileWithoutUser();

    const results = await controller.create(immobileToBeCreated, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when user _id is not provided', async () => {
    givenUserWithPermission();
    const immobileToBeCreated = givenImmobileWithoutUser_Id();

    const results = await controller.create(immobileToBeCreated, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when localization of immobile is not provided', async () => {
    givenUserWithPermission();
    const immobileToBeCreated = givenImmobileWithoutLocalization();

    const results = await controller.create(immobileToBeCreated, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when address of immobile is not provided', async () => {
    givenUserWithPermission();
    const immobileToBeCreated = givenImmobileWithoutAddressOfLocalization();

    const results = await controller.create(immobileToBeCreated, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when neighborhood of immobile is not provided', async () => {
    givenUserWithPermission();
    const immobileToBeCreated = givenImmobileWithoutNeighborhoodOfLocalization();

    const results = await controller.create(immobileToBeCreated, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when city of immobile is not provided', async () => {
    givenUserWithPermission();
    const immobileToBeCreated = givenImmobileWithoutCityOfLocalization();

    const results = await controller.create(immobileToBeCreated, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when zipCode of immobile is not provided', async () => {
    givenUserWithPermission();
    const immobileToBeCreated = givenImmobileWithoutZipCodeOfLocalization();

    const results = await controller.create(immobileToBeCreated, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when number of immobile is not provided', async () => {
    givenUserWithPermission();
    const immobileToBeCreated = givenImmobileWithoutNumberOfLocalization();

    const results = await controller.create(immobileToBeCreated, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when invalid number is', async () => {
    givenUserWithPermission();
    const immobileToBeCreated = givenImmobileWithInvalidNumberOfLocalization();

    const results = await controller.create(immobileToBeCreated, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create', async () => {
    givenUserWithPermission();
    const immobileToBeCreated = givenImmobile();
    const localizationWithId = {
      _id: "12313"
    };

    sinon.stub(userService, 'getById').callsFake(() => immobileToBeCreated.user);
    sinon.stub(localizationService, 'create').callsFake(() => localizationWithId);
    sinon.stub(immobileService, 'create').callsFake(() => {});
    const results = await controller.create(immobileToBeCreated, REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

  it('update Returns 500 when id is not provided', async () => {
    givenUserWithPermission();
    const immobileToBeUpdated = givenImmobile();

    const results = await controller.update(immobileToBeUpdated, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('update Returns 500 when localization id is not provided', async () => {
    givenUserWithPermission();
    const immobileToBeUpdated = givenImmobileWithId();

    const results = await controller.update(immobileToBeUpdated, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('update Returns 500 when localization address is not provided', async () => {
    givenUserWithPermission();
    var immobileToBeUpdated = givenImmobileWithoutAddressOfLocalization();
    immobileToBeUpdated["_id"] = "askdja";
    immobileToBeUpdated.localization["_id"] = "asdasd";

    const results = await controller.update(immobileToBeUpdated, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it("update", async () => {
    givenUserWithPermission();
    var immobileToBeUpdated = givenImmobileWithId();
    immobileToBeUpdated.localization["_id"] = "akjsdghk";

    sinon.stub(localizationService, 'getById').callsFake(() => immobileToBeUpdated.localization);
    sinon.stub(localizationService, 'update').callsFake(() => immobileToBeUpdated.localization);
    sinon.stub(immobileService, 'update').callsFake(() => immobileToBeUpdated);
    sinon.stub(immobileService, 'getById').callsFake(() => immobileToBeUpdated);
    const results = await controller.update(immobileToBeUpdated, REQUEST_MOCKED);
    
    expect(results.message).toBe("Operação realizada com sucesso!");
  });

  it("update Returns 500 when localization id is invalid", async () => {
    givenUserWithPermission();
    var immobileToBeUpdated = givenImmobileWithId();
    immobileToBeUpdated.localization["_id"] = "akjsdghk";

    sinon.stub(localizationService, 'getById').rejects(new Error("invalid id"));
    const results = await controller.update(immobileToBeUpdated, REQUEST_MOCKED);
    
    expect(results.status).toBe(500);
  });

  it("addClient Returns 500 when none data is provided", async () => {
    givenUserWithPermission();
    const results = await controller.addClient(null, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it("addClient Returns 500 when none _id is provided", async () => {
    givenUserWithPermission();
    const results = await controller.addClient({}, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it("addClient Returns 500 when client is not provided", async () => {
    givenUserWithPermission();
    const immobile = {
      _id: "abc"
    };

    const results = await controller.addClient(immobile, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it("addClient Returns 500 when client _id is not provided", async () => {
    givenUserWithPermission();
    const immobile = {
      _id: "abc",
      client: {

      }
    };

    const results = await controller.addClient(immobile, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it("addClient", async () => {
    givenUserWithPermission();
    const immobile = {
      _id: "abc",
      client: {
        _id: "abc"
      }
    };

    sinon.stub(immobileService, 'getById').callsFake(() => immobile);
    sinon.stub(immobileService, 'update').callsFake(() => immobile);
    const results = await controller.addClient(immobile, REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

  it("addClient Returns 500 when none data is provided", async () => {
    givenUserWithPermission();
    const results = await controller.removeClient(null, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it("addClient Returns 500 when none _id is provided", async () => {
    givenUserWithPermission();
    const results = await controller.removeClient({}, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it("addClient Returns 500 when client is not provided", async () => {
    givenUserWithPermission();
    const immobile = {
      _id: "abc"
    };

    const results = await controller.removeClient(immobile, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it("addClient Returns 500 when client _id is not provided", async () => {
    givenUserWithPermission();
    const immobile = {
      _id: "abc",
      client: {

      }
    };

    const results = await controller.removeClient(immobile, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it("removeClient", async () => {
    givenUserWithPermission();

    const immobile = {
      _id: "abc",
      client: {
        _id: "abc"
      }
    };

    sinon.stub(immobileService, 'getById').callsFake(() => immobile);
    sinon.stub(immobileService, 'update').callsFake(() => immobile);
    const results = await controller.removeClient(immobile, REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

  function givenUserWithPermission(){
    sinon.stub(groupService, 'hasPermission').callsFake(() => true);
  };

  function givenUserWithoutPermission(){
    sinon.stub(groupService, 'hasPermission').callsFake(() => false);
  };

});

function givenImmobileWithoutName() {
  return {
  };
}

function givenImmobileWithoutUser() {
  return Object.assign(givenImmobileWithoutName(), {
    name: "alksjdlaksjd"
  });
};

function givenImmobileWithoutUser_Id() {
  return Object.assign(givenImmobileWithoutUser(), {
    user: {
      name: "abc"
    }
  });
};

function givenImmobileWithoutLocalization() {
  return Object.assign(givenImmobileWithoutUser(), {
    user: {
      name: "abc",
      _id: "12312"
    }
  });
};

function givenImmobileWithoutAddressOfLocalization() {
  return {
    name: "abc",
    user: {
      _id: "123"
    },
    localization: {
      city: "abc",
      neighborhood: "abc",
      zipCode: "abc",
      number: 11111,
    }
  }
};

function givenImmobileWithoutCityOfLocalization() {
  return {
    name: "abc",
    user: {
      _id: "123"
    },
    localization: {
      address: "abc",
      neighborhood: "abc",
      zipCode: "abc",
      number: 11111,
    }
  }
};

function givenImmobileWithoutNeighborhoodOfLocalization() {
  return {
    name: "abc",
    user: {
      _id: "123"
    },
    localization: {
      city: "abc",
      address: "abc",
      zipCode: "abc",
      number: 11111,
    }
  }
};

function givenImmobileWithoutZipCodeOfLocalization() {
  return {
    name: "abc",
    user: {
      _id: "123"
    },
    localization: {
      city: "abc",
      address: "abc",
      neighborhood: "abc",
      number: 11111,
    }
  }
};

function givenImmobileWithoutNumberOfLocalization() {
  return {
    name: "abc",
    user: {
      _id: "123"
    },
    localization: {
      city: "abc",
      address: "abc",
      zipCode: "abc",
      neighborhood: "abc",
    }
  }
};

function givenImmobileWithInvalidNumberOfLocalization() {
  return {
    name: "abc",
    user: {
      _id: "123"
    },
    localization: {
      city: "abc",
      address: "abc",
      zipCode: "abc",
      neighborhood: "abc",
      number: "asdjalskjd",
    }
  }
};

function givenImmobile() {
  return {
    name: "abc",
    user: {
      _id: "slkajsdlka",
      name: "aksjdl"
    },
    localization: {
      address: "abc",
      zipCode: "abc",
      city: "abc",
      neighborhood: "abc",
      number: 1234
    }
  }
};

function givenImmobileWithId() {
  return {
    _id: "asjdhak",
    name: "abc",
    user: {
      _id: "slkajsdlka",
      name: "aksjdl"
    },
    localization: {
      address: "abc",
      zipCode: "abc",
      city: "abc",
      neighborhood: "abc",
      number: 1234
    }
  }
};


