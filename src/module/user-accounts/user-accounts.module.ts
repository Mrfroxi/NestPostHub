import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountsConfig } from '@src/module/user-accounts/config/user-accounts.config';
import { User } from '@src/module/user-accounts/domain/user.entity';
import { UsersRepository } from '@src/module/user-accounts/infrastructure/user.repository';
import { AuthController } from '@src/module/user-accounts/api/auth.controller';
import { AuthQueryRepository } from '@src/module/user-accounts/infrastructure/query/auth.query-repository';
import { CreateUserUseCase } from '@src/module/user-accounts/application/useCases/create-user.usecase';
import { RegisterUserUseCase } from '@src/module/user-accounts/application/useCases/register-user.usecase';
import { ConfirmUserUseCase } from '@src/module/user-accounts/application/useCases/confirm-user.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [
    UserAccountsConfig,
    UsersRepository,
    AuthQueryRepository,
    CreateUserUseCase,
    RegisterUserUseCase,
    ConfirmUserUseCase,
  ],
})
export class UserAccountsModule {}
