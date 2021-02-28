import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MongooseModule } from '@nestjs/mongoose';
import { GroupModule } from './controllers/group/group.module';
import { RoleModule } from './controllers/role/role.module';
import { UserModule } from './controllers/user/user.module';
import { AuthorizationMiddleware } from './middlewares/authorization.middleware';
import { RoleController } from './controllers/role/role.controller';
import { GroupController } from './controllers/group/group.controller';
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthorizationMiddleware)
      .forRoutes(RoleController, 
        GroupController, 
        {path: 'user', method: RequestMethod.GET},
        {path: 'user', method: RequestMethod.POST},
        {path: 'user', method: RequestMethod.PUT},
        {path: 'user/:id', method: RequestMethod.GET},
        {path: 'user/:id', method: RequestMethod.DELETE})
    
  }
}
