import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MongooseModule } from '@nestjs/mongoose';
import { GroupModule } from './controllers/group/group.module';
import { RoleController } from './controllers/role/role.controller';
import { UserController } from './controllers/user/user.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/testing'),
    GroupModule
  ],
  controllers: [AppController, RoleController, UserController],
  providers: [AppService],
})
export class AppModule {}
