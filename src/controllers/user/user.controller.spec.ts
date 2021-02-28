import { createParamDecorator } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserModule } from './user.module';
const sinon = require('sinon');

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const MOCKED_USER = {
    name: "ABCED",
    email: "abc@gmail.com",
    phone: "(88)88888-8888",
    cpfCnpj: "123.123.123-12",
    group: "1231231"
  };

  beforeEach(async () => {
    userService = new UserService(null);
    controller = new UserController(userService);
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
    const results = await controller.getAll();

    expect(results.status).toBe(200);
  });

  it('getById Returns 500', async () => {
    const id = "";
    sinon.stub(userService, 'getById').rejects(new Error("id invalid"));
    const results = await controller.getById(id);

    expect(results.status).toBe(500);
  });

  it('getById', async () => {
    const id = "ascasca";
    sinon.stub(userService, 'getById').callsFake(() => MOCKED_USER);
    const results = await controller.getById(id);

    expect(results.status).toBe(200);
  });

  it('delete Returns 500', async () => {
    const id = "";
    sinon.stub(userService, 'getById').rejects(new Error("id invalid"));
    
    const results = await controller.delete(id);
    expect(results.status).toBe(500);
  });

  it('delete', async () => {
    const id = "";
    sinon.stub(userService, 'getById').callsFake(() => MOCKED_USER);
    sinon.stub(userService, 'update').callsFake(() => MOCKED_USER);
    
    const results = await controller.delete(id);
    expect(results.status).toBe(200);
  });

  it('create Returns 500 when null user is provided', async () => {
    const results = await controller.create(null);
    expect(results.status).toBe(500);
  });

  it('create Returns 500 when user has not name', async () => {
    const MOCKED_USER_WITHOUT_NAME = {
      email: "ABC@"
    };

    const results = await controller.create(MOCKED_USER_WITHOUT_NAME);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when user has not email', async () => {
    const MOCKED_USER_WITHOUT_EMAIL = {
      name: "ABCASKJDA"
    };

    const results = await controller.create(MOCKED_USER_WITHOUT_EMAIL);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when user has not cpf or cnpj', async () => {
    const MOCKED_USER_WITHOUT_CPF = {
      name: "ABCASKJDA",
      email: "abc@gmail.com"
    };

    const results = await controller.create(MOCKED_USER_WITHOUT_CPF);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when user has not phone', async () => {
    const MOCKED_USER_WITHOUT_PHONE = {
      name: "ABCASKJDA",
      email: "abc@gmail.com",
      cpfCnpj: "000.000.000-00"
    };

    const results = await controller.create(MOCKED_USER_WITHOUT_PHONE);

    expect(results.status).toBe(500);
  });

  it('create Returns 500 when existing user with same email', async () => {
    sinon.stub(userService, 'findByQuery').callsFake(() => [MOCKED_USER]);

    const results = await controller.create(MOCKED_USER);

    expect(results.status).toBe(500);
  });

  it('create', async () => {
    sinon.stub(userService, 'findByQuery').callsFake(() => []);
    sinon.stub(userService, 'save').callsFake(() => MOCKED_USER);

    const results = await controller.create(MOCKED_USER);

    expect(results.status).toBe(200);
  });

  it('update Returns 500 when null user is provided', async () => {
    const results = await controller.update(null);
    expect(results.status).toBe(500);
  });

  it('update', async () => {
    sinon.stub(userService, 'getById').callsFake(() => MOCKED_USER);
    sinon.stub(userService, 'findByQuery').callsFake(() => []);
    sinon.stub(userService, 'update').callsFake(() => MOCKED_USER);

    const MOCKED_UPDATE_USER = Object.assign(MOCKED_USER, {id: "109238192i3jh1l23j"});

    const results = await controller.update(MOCKED_UPDATE_USER);

    expect(results.status).toBe(200);
  });

  it('update Returns 500 when existing user with email is returned', async () => {
    sinon.stub(userService, 'findByQuery').callsFake(() => []);
    sinon.stub(userService, 'update').callsFake(() => MOCKED_USER);

    const MOCKED_UPDATE_USER = Object.assign(MOCKED_USER, {id: "109238192i3jh1l23j"});

    const results = await controller.update(MOCKED_UPDATE_USER);

    expect(results.status).toBe(500);
  });

});
