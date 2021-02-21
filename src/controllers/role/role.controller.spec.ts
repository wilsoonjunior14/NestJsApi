import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role } from '../../../dist/controllers/role/role.model';
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findById', async () => {
    var id = "19283012j3k1j2";

    sinon.stub(service, 'findById').callsFake(() => MOCKED_ROLE);
    var role = await controller.findById(id);

    expect(role.description).toBe(MOCKED_ROLE.description);
  });

  it('findAllEnabledRoles', async () => {

    sinon.stub(service, 'findAllEnabledRoles').callsFake(() => [MOCKED_ROLE]);
    var roles = await controller.findAllEnabledRoles();

    expect(roles.length > 0).toBeTruthy();
  });

  it('createRole returns status 500', async () => {

    var returns = controller.createRole(roleMocked);

    expect(returns.status).toBe(500);
  });

  it('updateRole returns status 500', async () => {
    var returns = await controller.updateRole(roleMocked);

    expect(returns.status).toBe(500);
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

    expect(deletedRole.data.deleted).toBeTruthy();
  });

});
