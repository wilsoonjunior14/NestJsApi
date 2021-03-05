import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsSchema } from './logs.model';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Logs', schema: LogsSchema}])
    ],
    controllers: [LogsController],
    exports: [LogsService],
    providers: [LogsService],
  })
  export class LogsModule {}