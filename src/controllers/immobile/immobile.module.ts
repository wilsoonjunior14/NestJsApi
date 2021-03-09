import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImmobileController } from './immobile.controller';
import { ImmobileSchema } from './immobile.model';
import { ImmobileService } from './immobile.service';
import { UserModule } from '../user/user.module';
import { LocalizationModule } from '../localization/localization.module';
import { LogsModule } from '../logs/logs.module';
import { GroupModule } from '../group/group.module';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Immobile', schema: ImmobileSchema}]),
        UserModule,
        LocalizationModule,
        LogsModule,
        GroupModule
    ],
    controllers: [ImmobileController],
    providers: [ImmobileService],
})

export class ImmobileModule {}