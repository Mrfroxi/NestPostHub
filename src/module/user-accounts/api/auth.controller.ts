import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { Response } from 'express';
import { AuthQueryRepository } from '@src/module/user-accounts/infrastructure/query/auth.query-repository';
import { CreateUserInputDto } from '@src/module/user-accounts/api/input-dto/create-user.input-dto';
import { RegisterUserCommand } from '@src/module/user-accounts/application/useCases/register-user.usecase';
import { ConfirmUserInputDto } from '@src/module/user-accounts/api/input-dto/confirm-user.input-dto';
import { ConfirmUserCommand } from '@src/module/user-accounts/application/useCases/confirm-user.usecase';
import { RegistrationEmailResendingInputDto } from '@src/module/user-accounts/api/input-dto/registration-email-resending.input-dto';
import { RegistrationEmailResendingCommand } from '@src/module/user-accounts/application/useCases/registration-email-resending.usecase';
import {
  PasswordInputDto,
  PasswordRecoveryDto,
} from './input-dto/password.input-dto';
import { NewPasswordCommand } from '@src/module/user-accounts/application/useCases/new-password.usecase';
import { PasswordRecoveryCommand } from '../application/useCases/password-recovery.usecase';
import { LoginCommand } from '@src/module/user-accounts/application/useCases/login.usecase';
import { LoginInputDto } from '@src/module/user-accounts/api/input-dto/login-input.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private authQueryRepository: AuthQueryRepository,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  registration(@Body() body: CreateUserInputDto) {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  registrationConfirmation(@Body() body: ConfirmUserInputDto) {
    return this.commandBus.execute(new ConfirmUserCommand(body));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  registrationEmailResending(@Body() body: RegistrationEmailResendingInputDto) {
    return this.commandBus.execute(new RegistrationEmailResendingCommand(body));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  PasswordRecovery(@Body() body: PasswordRecoveryDto) {
    return this.commandBus.execute(new PasswordRecoveryCommand(body));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  newPassword(@Body() body: PasswordInputDto) {
    return this.commandBus.execute(new NewPasswordCommand(body));
  }

  @Post('login')
  async login(
    @Body() body: LoginInputDto,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new LoginCommand(body.loginOrEmail, body.password, ip),
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken };
  }
}
