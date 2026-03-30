import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './api/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './infastructure/users.repository';
import { UsersQueryRepository } from './infastructure/query/users.query-repository';
import { Argon2Service } from '../../core/external-service/argon2.service';
import { AuthController } from './api/auth.controller';
import { LocalStrategy } from '../../core/guards/local/local.strategy';
import { AuthService } from './application/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../../core/guards/jwt/jwt.strategy';
import { Session, SessionSchema } from './domain/session.entity';
import { SessionRepository } from './infastructure/session.repository';
import { SessionService } from './application/session.service';
import { ConfigModule } from '@nestjs/config';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [UserController, AuthController],
  providers: [
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: process.env.JWT_SECRET_AUTH,
          signOptions: { expiresIn: '5m' },
        });
      },
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: process.env.JWT_SECRET_REF,
          signOptions: { expiresIn: '10m' },
        });
      },
    },
    UserService,
    UsersRepository,
    UsersQueryRepository,
    SessionService,
    SessionRepository,
    Argon2Service,
    LocalStrategy,
    JwtStrategy,
    AuthService,
  ],
})
export class UserAccountsModule {}
