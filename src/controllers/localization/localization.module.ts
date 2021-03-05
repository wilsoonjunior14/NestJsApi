import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocalizationSchema } from './localization.model';
import { LocalizationController } from './localization.controller';
import { LocalizationService } from './localization.service';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Localization', schema: LocalizationSchema}])
    ],
    exports: [LocalizationService],
    controllers: [LocalizationController],
    providers: [LocalizationService],
  })

  export class LocalizationModule {}