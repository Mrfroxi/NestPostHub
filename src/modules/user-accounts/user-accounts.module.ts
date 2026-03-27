import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './api/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './infastructure/users.repository';
import { UsersQueryRepository } from './infastructure/query/users.query-repository';
import { Argon2Service } from '../../core/external-service/argon2.service';
import { AuthController } from './api/auth.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { LocalStrategy } from '../../core/guards/local/local.strategy';
import { AuthService } from './application/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../core/guards/jwt/jwt.strategy';
import { Session, SessionSchema } from './domain/session.entity';
import { SessionRepository } from './infastructure/session.repository';
import { SessionService } from './application/session.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    MailerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_AUTH,
      signOptions: { expiresIn: '5m' },
    }),
  ],
  controllers: [UserController, AuthController],
  providers: [
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
