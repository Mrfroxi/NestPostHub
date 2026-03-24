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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MailerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '5m' },
    }),
  ],
  controllers: [UserController, AuthController],
  providers: [
    UserService,
    UsersRepository,
    UsersQueryRepository,
    Argon2Service,
    LocalStrategy,
    JwtStrategy,
    AuthService,
  ],
})
export class UserAccountsModule {}
