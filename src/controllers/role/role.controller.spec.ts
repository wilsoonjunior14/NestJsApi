import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role } from '../../../dist/controllers/role/role.model';
import { RoleModule } from './role.module';
const sinon = require('sinon');

describe('RoleController', () => {
  let controller: RoleController;
  let service: RoleService;

  var MOCKED_ROLE = {
    description: "TESTING"
  };

  var roleMocked: Role;

  beforeEach(async () => {
    service = new RoleService(null);
    controller = new RoleController(service);
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
    const results = await controller.findById(id);

    expect(results.status).toBe(200);
  });

  it('findById Returns 500 when invalid id is provided', async () => {
    var id = "";

    sinon.stub(service, 'findById').rejects(new Error("id invalid"));
    const results = await controller.findById(id);

    expect(results.status).toBe(500);
  });

  it('findAllEnabledRoles', async () => {
    sinon.stub(service, 'findAllEnabledRoles').callsFake(() => [MOCKED_ROLE]);
    var results = await controller.findAllEnabledRoles();

    expect(results.status).toBe(200);
  });

  it('createRole returns status 500', async () => {
    var returns = await controller.createRole(roleMocked);

    expect(returns.status).toBe(500);
  });

  it('createdRole', async () => {
    sinon.stub(service, 'create').callsFake(() => MOCKED_ROLE);
    sinon.stub(service, 'findByQuery').callsFake(() => []);

    var results = await controller.createRole(MOCKED_ROLE);

    expect(results.status).toBe(200);
  });

  it('updateRole returns status 500', async () => {
    var returns = await controller.updateRole(roleMocked);

    expect(returns.status).toBe(500);
  });

  it('updateRole', async () => {
    sinon.stub(service, 'findById').callsFake(() => MOCKED_ROLE);
    sinon.stub(service, 'update').callsFake(() => MOCKED_ROLE);
    sinon.stub(service, 'findByQuery').callsFake(() => []);
    const MOCKED_UPDATED_ROLE = Object.assign(MOCKED_ROLE, {_id: "1023lkj1l23"});

    var returns = await controller.updateRole(MOCKED_UPDATED_ROLE);

    expect(returns.status).toBe(200);
  });

  it ('deleteRole returns status 500', async () => {
    var returns = await controller.deleteRole(null);

    expect(returns.status).toBe(500);
  });

  it ('deleteRole', async () => {
    var id = "123123lj123lk1";
    var DELETED_ROLE = Object.assign(MOCKED_ROLE, {deleted: true});
    
    sinon.stub(service, 'findById').callsFake(() => MOCKED_ROLE);
    sinon.stub(service, 'update').callsFake(() => DELETED_ROLE);
    var deletedRole = await controller.deleteRole(id);

    expect(deletedRole.status).toBe(200);
  });

  it ('deleteRole Returns 500 when id provided is null', async () => {
    var id = "123123lj123lk1";
    
    sinon.stub(service, 'findById').rejects(new Error("id invalid"));
    var deletedRole = await controller.deleteRole(id);

    expect(deletedRole.status).toBe(500);
  });

});
