import { MongooseModule } from '@nestjs/mongoose';
import { RoleSchema } from './role.model';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
      MongooseModule.forFeature([{name: 'Role', schema: RoleSchema}])
  ],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}