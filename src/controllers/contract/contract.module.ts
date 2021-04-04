import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContractSchema } from './contract.model';
import { LogsModule } from '../logs/logs.module';
import { UserModule } from '../user/user.module';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { GroupModule } from '../group/group.module';
import { ImmobileModule } from '../immobile/immobile.module';
import { PaymentModule } from '../payment/payment.module';


@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Contract', schema: ContractSchema}]),
        LogsModule,
        UserModule,
        GroupModule,
        ImmobileModule,
        forwardRef(() => PaymentModule)
    ],
    exports: [ContractService],
    controllers: [ContractController],
    providers: [ContractService],
  })
export class ContractModule {}