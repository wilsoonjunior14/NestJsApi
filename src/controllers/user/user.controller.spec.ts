import { createParamDecorator } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { MailService } from '../../utils/Mail.service';
import { Utils } from '../../utils/Utils';
import { LogsService } from '../logs/logs.service';
const sinon = require('sinon');

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let mailService: MailService;
  let utils: Utils;
  let logService: LogsService;

  const MOCKED_USER = {
    name: "ABCED",
    email: "abc@gmail.com",
    phone: "(88)88888-8888",
    cpfCnpj: "123.123.123-12",
    group: "1231231",
    password: "12345"
  };

  var REQUEST_MOCKED = {
    headers: {
      authorization: "Bearer abcde"
    }
  };

  beforeEach(async () => {
    logService = new LogsService(null);
    userService = new UserService(null, null);
    utils = new Utils(logService, userService);
    mailService = new MailService(null);
    controller = new UserController(userService, mailService, logService);
    utils = new Utils(logService, userService);

    sinon.stub(userService, 'getDataByToken').callsFake(() => {});
    sinon.stub(logService, 'saveLog').callsFake(() => {});
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('user module is defined', () => {
    const userModule = new UserModule();

    expect(userModule).toBeDefined();
  });

  it('getAll', async () => {
    sinon.stub(userService, 'getAllEnabled').callsFake(() => [MOCKED_USER]);
    const results = await controller.getAll(REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

  it('getById Returns 500', async () => {
    const id = "";
    sinon.stub(userService, 'getById').rejects(new Error("id invalid"));
    const results = await controller.getById(id, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('getById', async () => {
    const id = "ascasca";
    sinon.stub(userService, 'getById').callsFake(() => MOCKED_USER);
    const results = await controller.getById(id, REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

  it('delete Returns 500', async () => {
    const id = "";
    sinon.stub(userService, 'getById').rejects(new Error("id invalid"));
    
    const results = await controller.delete(id, REQUEST_MOCKED);
    expect(results.status).toBe(500);
  });

  it('delete', async () => {
    const id = "";
    sinon.stub(userService, 'getById').callsFake(() => MOCKED_USER);
    sinon.stub(userService, 'update').callsFake(() => MOCKED_USER);
    
    const results = await controller.delete(id, REQUEST_MOCKED);
    expect(results.status).toBe(200);
  });

  it('create Returns 500 when null user is provided', async () => {
    const results = await controller.create(null, REQUEST_MOCKED);
    expect(results.status).toBe(500);
  });

  it('create Returns 500 when user has not name', async () => {
    const MOCKED_USER_WITHOUT_NAME = {
      email: "ABC@"
    };

    const results = await controller.create(MOCKED_USER_WITHOUT_NAME, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when user has not email', async () => {
    const MOCKED_USER_WITHOUT_EMAIL = {
      name: "ABCASKJDA"
    };

    const results = await controller.create(MOCKED_USER_WITHOUT_EMAIL, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when user has not cpf or cnpj', async () => {
    const MOCKED_USER_WITHOUT_CPF = {
      name: "ABCASKJDA",
      email: "abc@gmail.com"
    };

    const results = await controller.create(MOCKED_USER_WITHOUT_CPF, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when user has not phone', async () => {
    const MOCKED_USER_WITHOUT_PHONE = {
      name: "ABCASKJDA",
      email: "abc@gmail.com",
      cpfCnpj: "000.000.000-00"
    };

    const results = await controller.create(MOCKED_USER_WITHOUT_PHONE, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when existing user with same email', async () => {
    sinon.stub(userService, 'findByQuery').callsFake(() => [MOCKED_USER]);

    const results = await controller.create(MOCKED_USER, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('create', async () => {
    sinon.stub(userService, 'findByQuery').callsFake(() => []);
    sinon.stub(userService, 'save').callsFake(() => MOCKED_USER);

    const results = await controller.create(MOCKED_USER, REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

  it('update Returns 500 when null user is provided', async () => {
    const results = await controller.update(null, REQUEST_MOCKED);
    expect(results.status).toBe(500);
  });

  it('update', async () => {
    sinon.stub(userService, 'getById').callsFake(() => MOCKED_USER);
    sinon.stub(userService, 'findByQuery').callsFake(() => []);
    sinon.stub(userService, 'update').callsFake(() => MOCKED_USER);

    const MOCKED_UPDATE_USER = Object.assign(MOCKED_USER, {id: "109238192i3jh1l23j"});

    const results = await controller.update(MOCKED_UPDATE_USER, REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

  it('update Returns 500 when existing user with email is returned', async () => {
    sinon.stub(userService, 'findByQuery').callsFake(() => []);
    sinon.stub(userService, 'update').callsFake(() => MOCKED_USER);

    const MOCKED_UPDATE_USER = Object.assign(MOCKED_USER, {id: "109238192i3jh1l23j"});

    const results = await controller.update(MOCKED_UPDATE_USER, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('login Returns 500 when email is not informed', async () => {
    const results = await controller.login({}, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('login Returns 500 when password is not informed', async () => {
    const MOCKED_USER = {
      email: "any@gmail.com"
    };

    const results = await controller.login(MOCKED_USER, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('login Returns 500 when user is not found', async () => {
    const MOCKED_USER = {
      email: "any@gmail.com",
      password: "12345"
    };

    sinon.stub(userService, 'findByQuery').callsFake(() => []);

    const results = await controller.login(MOCKED_USER, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('login Returns 500 when password is invalid', async () => {
    const MOCKED_USER = {
      email: "any@gmail.com",
      password: "12345"
    };

    const FOUND_USER = Object.assign(MOCKED_USER, {password: utils.getsNewPassword("1234519283019283")});

    sinon.stub(userService, 'findByQuery').callsFake(() => [FOUND_USER]);
    sinon.stub(userService, 'comparePasswords').callsFake(() => false);

    const results = await controller.login(MOCKED_USER, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('login', async () => {
    const MOCKED_USER = {
      email: "any@gmail.com",
      password: "12345"
    };

    const FOUND_USER = Object.assign(MOCKED_USER, {password: utils.getsNewPassword("12345")});

    sinon.stub(userService, 'findByQuery').callsFake(() => [FOUND_USER]);
    sinon.stub(userService, 'getToken').callsFake(() => "1234567890");
    sinon.stub(userService, 'comparePasswords').callsFake(() => true);

    const results = await controller.login(MOCKED_USER, REQUEST_MOCKED);

    expect(results.status).toBe(200);
    expect(results.data.access_token).toBeDefined();
  });

  it('tokenIsValid Returns 500 when payload is not provided', async () => {
    const results = await controller.tokenIsValid(null, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('tokenIsValid Returns 500 when access_token is not provided', async () => {
    const results = await controller.tokenIsValid({}, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('tokenIsValid', async () => {
    const payload = {
      access_token: "1234567890"
    };

    sinon.stub(userService, 'checksIfTokenIsValid').callsFake(() => true);
    const results = await controller.tokenIsValid(payload, REQUEST_MOCKED);

    expect(results.status).toBe(200);
    expect(results.data.isValid).toBe(true);
  });

  it('recoveryPassword Returns 500 when email is not provided', async () => {
    const results = await controller.recoveryPassword({}, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('recoveryPassword Returns 500 when user is not found', async () => {
    const MOCKED_USER = {
      email: "any@gmail.com"
    };

    sinon.stub(userService, 'findByQuery').callsFake(() => []);
    const results = await controller.recoveryPassword(MOCKED_USER, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('recoveryPassword', async () => {
    const MOCKED_USER = {
      email: "any@gmail.com"
    };

    sinon.stub(userService, 'findByQuery').callsFake(() => [MOCKED_USER]);
    sinon.stub(userService, 'update').callsFake(() => {});
    sinon.stub(mailService, 'sendRecoveryPasswordMail').callsFake(() => {});
    const results = await controller.recoveryPassword(MOCKED_USER, REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

  it('validateCode Returns 500 when code is not provided', async () => {
    const results = await controller.validateCode({}, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('validateCode Returns 500 when email is not provided', async () => {
    const data = {
      verificationCode: "12345"
    };

    const results = await controller.validateCode(data, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('validateCode Returns 500 when user is not found', async () => {
    const data = {
      verificationCode: "12345",
      email: "any@gmail.com"
    };

    sinon.stub(userService, 'findByQuery').callsFake(() => []);
    const results = await controller.validateCode(data, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('validateCode', async () => {
    const data = {
      verificationCode: "12345",
      email: "any@gmail.com"
    };

    sinon.stub(userService, 'findByQuery').callsFake(() => [data]);
    const results = await controller.validateCode(data, REQUEST_MOCKED);

    expect(results.status).toBe(200);
    expect(results.data.validated).toBe(true);
  });

  it('udpatePassword Returns 500 when data is not provided', async () => {
    const results = await controller.updatePassword({}, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });


  it('udpatePassword Returns 500 when email is invalid', async () => {
    const MOCKED_USER = {
      email: "any2@gmail.com",
      verificationCode: "1234",
      password: "1234"
    };

    const results = await controller.updatePassword(MOCKED_USER, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('udpatePassword Returns 500 when user is not found', async () => {
    const MOCKED_USER = {
      email: "any@gmail.com",
      verificationCode: "1234",
      password: "1234"
    };

    sinon.stub(userService, 'findByQuery').callsFake(() => []);
    const results = await controller.updatePassword(MOCKED_USER, REQUEST_MOCKED);

    expect(results.status).toBe(500);
  });

  it('udpatePassword', async () => {
    const MOCKED_USER = {
      email: "any@gmail.com",
      verificationCode: "1234",
      password: "1234"
    };

    sinon.stub(userService, 'findByQuery').callsFake(() => [MOCKED_USER]);
    sinon.stub(userService, 'update').callsFake(() => {});
    const results = await controller.updatePassword(MOCKED_USER, REQUEST_MOCKED);

    expect(results.status).toBe(200);
  });

});
