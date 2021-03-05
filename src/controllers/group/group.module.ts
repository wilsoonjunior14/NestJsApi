import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsModule } from '../logs/logs.module';
import { GroupController } from './group.controller';
import { GroupSchema } from './group.model';
import { GroupService } from './group.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
      MongooseModule.forFeature([{name: 'Group', schema: GroupSchema}]),
      LogsModule,
      UserModule
  ],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
