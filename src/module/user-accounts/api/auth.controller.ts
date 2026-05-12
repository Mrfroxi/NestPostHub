import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
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
import { PasswordRecoveryCommand } from '@src/module/user-accounts/application/useCases/password-recovery.useCase';
import { LoginInputDto } from '@src/module/user-accounts/api/input-dto/login.input-dto';
import { LoginCommand } from '@src/module/user-accounts/application/useCases/login.usecase';
import { RefreshTokenCommand } from '@src/module/user-accounts/application/useCases/refresh-token.usecase';
import { LogoutCommand } from '@src/module/user-accounts/application/useCases/logout.usecase';
import { JwtAuthGuard } from '@src/module/user-accounts/infrastructure/guards/jwt-auth.guard';

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
  login(
    @Body() body: LoginInputDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.commandBus.execute(
      new LoginCommand(body, ip, userAgent || 'unknown'),
    );
  }

  @Post('refresh-token')
  refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.commandBus.execute(new RefreshTokenCommand(refreshToken));
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(@Body('refreshToken') refreshToken: string) {
    return this.commandBus.execute(new LogoutCommand(refreshToken));
  }
}
