import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountsConfig } from '@src/module/user-accounts/config/user-accounts.config';
import User from '@src/module/user-accounts/domain/user.entity';
import { UsersRepository } from '@src/module/user-accounts/infrastructure/user.repository';
import { AuthController } from '@src/module/user-accounts/api/auth.controller';
import { AuthQueryRepository } from '@src/module/user-accounts/infrastructure/query/auth.query-repository';
import { CreateUserUseCase } from './application/useCases/auth/create-user.usecase';
import { RegisterUserUseCase } from './application/useCases/auth/register-user.usecase';
import { ConfirmUserUseCase } from './application/useCases/auth/confirm-user.usecase';
import { RegistrationEmailResendingUseCase } from './application/useCases/auth/registration-email-resending.usecase';
import { NewPasswordUseCase } from './application/useCases/auth/new-password.usecase';
import { PasswordRecoveryEmailUseCase } from './application/useCases/auth/password-recovery.usecase';
import { JwtStrategy } from '@src/module/user-accounts/guards/bearer/jwt.strategy';
import { JwtRefreshCookieGuard } from '@src/module/user-accounts/guards/cookie/jwt-cookie.guard';
import { DeviceSession } from '@src/module/user-accounts/domain/device-session.entity';
import { DeviceSessionRepository } from '@src/module/user-accounts/infrastructure/device-session.repository';
import { LoginUseCase } from './application/useCases/auth/login.usecase';
import { RefreshTokenUseCase } from './application/useCases/auth/refresh-token.usecase';
import { LogoutUseCase } from './application/useCases/auth/logout.usecase';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '@src/module/user-accounts/constants/auth-tokens.inject-constants';
import { SecurityController } from './api/security.controller';
import { TerminateSessionUseCase } from './application/useCases/security/terminate-session.usecase';
import { TerminateOtherSessionsUseCase } from './application/useCases/security/terminate-other-sessions.usecase';
import { SaController } from './api/sa.controller';
import { UsersController } from './api/users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, DeviceSession]),
    JwtModule,
    PassportModule,
  ],
  controllers: [AuthController, SecurityController, SaController, UsersController],
  exports: [AuthQueryRepository, DeviceSessionRepository],
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
    TerminateSessionUseCase,
    TerminateOtherSessionsUseCase,
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
