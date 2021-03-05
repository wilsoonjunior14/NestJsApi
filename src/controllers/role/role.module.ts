import { MongooseModule } from '@nestjs/mongoose';
import { RoleSchema } from './role.model';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Module } from '@nestjs/common';
import { LogsModule } from '../logs/logs.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
      MongooseModule.forFeature([{name: 'Role', schema: RoleSchema}]),
      LogsModule,
      UserModule
  ],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}