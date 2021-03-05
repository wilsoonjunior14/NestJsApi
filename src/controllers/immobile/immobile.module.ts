import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImmobileController } from './immobile.controller';
import { ImmobileSchema } from './immobile.model';
import { ImmobileService } from './immobile.service';
import { UserModule } from '../user/user.module';
import { LocalizationModule } from '../localization/localization.module';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Immobile', schema: ImmobileSchema}]),
        UserModule,
        LocalizationModule
    ],
    controllers: [ImmobileController],
    providers: [ImmobileService],
})

export class ImmobileModule {}