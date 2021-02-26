import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MongooseModule } from '@nestjs/mongoose';
import { GroupModule } from './controllers/group/group.module';
import { RoleModule } from './controllers/role/role.module';
import { UserModule } from './controllers/user/user.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/testing'),
    GroupModule,
    RoleModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
