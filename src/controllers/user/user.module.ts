import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.model';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { Constants } from '../../utils/Contansts';

@Module({
  imports: [
      MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
      JwtModule.register({
        secret: Constants.SECRET_KEY,
        signOptions: {
          expiresIn: '24h'
        }
      }),
  ],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
