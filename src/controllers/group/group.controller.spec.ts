import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';

describe('GroupController', () => {
  let controller: GroupController;
  let service: GroupService;

  beforeEach(async () => {
    service = new GroupService(null);
    controller = new GroupController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
