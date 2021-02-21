import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MongooseModule } from '@nestjs/mongoose';
import { GroupModule } from './controllers/group/group.module';
import { UserController } from './controllers/user/user.controller';
import { RoleModule } from './controllers/role/role.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/testing'),
    GroupModule,
    RoleModule
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
