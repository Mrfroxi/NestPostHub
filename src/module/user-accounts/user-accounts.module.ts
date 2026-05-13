import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountsConfig } from '@src/module/user-accounts/config/user-accounts.config';
import User from '@src/module/user-accounts/domain/user.entity';
import { UsersRepository } from '@src/module/user-accounts/infrastructure/user.repository';
import { AuthController } from '@src/module/user-accounts/api/auth.controller';
import { AuthQueryRepository } from '@src/module/user-accounts/infrastructure/query/auth.query-repository';
import { CreateUserUseCase } from '@src/module/user-accounts/application/useCases/create-user.usecase';
import { RegisterUserUseCase } from '@src/module/user-accounts/application/useCases/register-user.usecase';
import { ConfirmUserUseCase } from '@src/module/user-accounts/application/useCases/confirm-user.usecase';
import { RegistrationEmailResendingUseCase } from '@src/module/user-accounts/application/useCases/registration-email-resending.usecase';
import { NewPasswordUseCase } from '@src/module/user-accounts/application/useCases/new-password.usecase';
import { PasswordRecoveryEmailUseCase } from './application/useCases/password-recovery.usecase';
import { JwtStrategy } from '@src/module/user-accounts/guards/bearer/jwt.strategy';
import { JwtRefreshCookieGuard } from '@src/module/user-accounts/guards/cookie/jwt-cookie.guard';
import { DeviceSession } from '@src/module/user-accounts/domain/device-session.entity';
import { DeviceSessionRepository } from '@src/module/user-accounts/infrastructure/device-session.repository';
import { LoginUseCase } from '@src/module/user-accounts/application/useCases/login.usecase';
import { RefreshTokenUseCase } from '@src/module/user-accounts/application/useCases/refresh-token.usecase';
import { LogoutUseCase } from '@src/module/user-accounts/application/useCases/logout.usecase';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '@src/module/user-accounts/constants/auth-tokens.inject-constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, DeviceSession]),
    JwtModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    UserAccountsConfig,
    UsersRepository,
    AuthQueryRepository,
    CreateUserUseCase,
    RegisterUserUseCase,
    ConfirmUserUseCase,
    RegistrationEmailResendingUseCase,
    PasswordRecoveryEmailUseCase,
    NewPasswordUseCase,
    DeviceSessionRepository,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    JwtRefreshCookieGuard,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.accessTokenSecret,
          signOptions: {
            expiresIn: userAccountConfig.accessTokenExpireIn as any,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.refreshTokenSecret,
          signOptions: {
            expiresIn: userAccountConfig.refreshTokenExpireIn as any,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
    JwtStrategy,
  ],
})
export class UserAccountsModule {}
