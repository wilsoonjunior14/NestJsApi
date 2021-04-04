import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSchema } from './payment.model';
import { LogsModule } from '../logs/logs.module';
import { GroupModule } from '../group/group.module';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { UserModule } from '../user/user.module';
import { ContractService } from '../contract/contract.service';
import { ContractModule } from '../contract/contract.module';


@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Payment', schema: PaymentSchema}]),
        LogsModule,
        forwardRef(() => GroupModule),
        forwardRef(() => UserModule),
        forwardRef(() => ContractModule)
    ],
    exports: [PaymentService],
    controllers: [PaymentController],
    providers: [PaymentService],
  })
  export class PaymentModule {}