import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './api/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './infastructure/users.repository';
import { UsersQueryRepository } from './infastructure/query/users.query-repository';
import { Argon2Service } from '../../core/external-service/argon2.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UsersRepository,
    UsersQueryRepository,
    Argon2Service,
  ],
})
export class UserAccountsModule {}
