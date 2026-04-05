import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import {
  ConfirmationCodeInputDto,
  ResendEmailInputDto,
} from './input-dto/resendEmail.input.dto';
import { NewPasswordInputDto } from './input-dto/new-password.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';
import { LoginInputDto } from './input-dto/login.input-dto';
import { JwtAuthGuard } from '../../../core/guards/jwt/jwt-auth.guard';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/useCases/auth/register-user-command';
import { ResendEmailCommand } from '../application/useCases/auth/resend-email-command';
import { ConfirmEmailCommand } from '../application/useCases/auth/confirm-email-command';
import { PasswordRecoveryCommand } from '../application/useCases/auth/password-recovery-command';
import { NewPasswordCommand } from '../application/useCases/auth/new-password-command';
import {
  LoginCommand,
  LoginResult,
} from '../application/useCases/auth/login-command';
import { AuthService } from '../application/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registerUser(
    @Body() createUserInputDto: CreateUserInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new RegisterUserCommand(createUserInputDto));
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendEmail(
    @Body() resendEmailCodeInputDto: ResendEmailInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new ResendEmailCommand(resendEmailCodeInputDto),
    );
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmationUser(
    @Body() code: ConfirmationCodeInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new ConfirmEmailCommand(code));
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() dto: PasswordRecoveryInputDto): Promise<void> {
    await this.commandBus.execute(new PasswordRecoveryCommand(dto));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() dto: NewPasswordInputDto): Promise<void> {
    await this.commandBus.execute(new NewPasswordCommand(dto));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginInputDto): Promise<LoginResult> {
    return this.commandBus.execute(new LoginCommand(dto));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: { login: string }) {
    return this.authService.getCurrentUser(user.login);
  }
}
