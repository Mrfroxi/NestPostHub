import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { Request, Response } from 'express';
import { AuthQueryRepository } from '@src/module/user-accounts/infrastructure/query/auth.query-repository';
import { CreateUserInputDto } from '@src/module/user-accounts/api/input-dto/create-user.input-dto';
import { RegisterUserCommand } from '../application/useCases/auth/register-user.usecase';
import { ConfirmUserInputDto } from '@src/module/user-accounts/api/input-dto/confirm-user.input-dto';
import { ConfirmUserCommand } from '../application/useCases/auth/confirm-user.usecase';
import { RegistrationEmailResendingInputDto } from '@src/module/user-accounts/api/input-dto/registration-email-resending.input-dto';
import { RegistrationEmailResendingCommand } from '../application/useCases/auth/registration-email-resending.usecase';
import {
  PasswordInputDto,
  PasswordRecoveryDto,
} from './input-dto/password.input-dto';
import { NewPasswordCommand } from '../application/useCases/auth/new-password.usecase';
import { PasswordRecoveryCommand } from '../application/useCases/auth/password-recovery.usecase';
import { LoginCommand } from '../application/useCases/auth/login.usecase';
import { LoginInputDto } from '@src/module/user-accounts/api/input-dto/login-input.dto';
import { RefreshTokenCommand } from '../application/useCases/auth/refresh-token.usecase';
import { LogoutCommand } from '../application/useCases/auth/logout.usecase';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';
import { JwtAuthGuard } from '@src/module/user-accounts/guards/bearer/jwt-auth.guard';
import { JwtRefreshCookieGuard } from '@src/module/user-accounts/guards/cookie/jwt-cookie.guard';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import type { UserPayload } from '@core/decorators/current-user.decorator';
import { RateLimitGuard } from '@src/module/rate-limit/guards/rate-limit.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private authQueryRepository: AuthQueryRepository,
  ) {}
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  registration(@Body() body: CreateUserInputDto) {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  registrationConfirmation(@Body() body: ConfirmUserInputDto) {
    return this.commandBus.execute(new ConfirmUserCommand(body));
  }
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  registrationEmailResending(@Body() body: RegistrationEmailResendingInputDto) {
    return this.commandBus.execute(new RegistrationEmailResendingCommand(body));
  }
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  PasswordRecovery(@Body() body: PasswordRecoveryDto) {
    return this.commandBus.execute(new PasswordRecoveryCommand(body));
  }
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  newPassword(@Body() body: PasswordInputDto) {
    return this.commandBus.execute(new NewPasswordCommand(body));
  }
  @UseGuards(RateLimitGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginInputDto,
    @Req() req: Request,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const title = (req.headers['user-agent'] as string) ?? '';

    const { accessToken, refreshToken } = await this.commandBus.execute(
      new LoginCommand(body.loginOrEmail, body.password, ip, title),
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken };
  }

  @UseGuards(JwtRefreshCookieGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @CurrentUser() user: UserPayload,
    @Req() req: Request,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const title = (req.headers['user-agent'] as string) ?? '';

    const { accessToken, refreshToken } = await this.commandBus.execute(
      new RefreshTokenCommand(user.userId, user.deviceId, ip, title),
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken };
  }

  @UseGuards(JwtRefreshCookieGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() user: UserPayload): Promise<void> {
    await this.commandBus.execute(
      new LogoutCommand(user.userId, user.deviceId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(
    @CurrentUser() user: UserPayload,
  ): Promise<{ email: string; login: string; userId: string }> {
    const foundUser = await this.authQueryRepository.getUserById(user.userId);
    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'User not found',
        extensions: [{ message: 'User not found', field: 'userId' }],
      });
    }

    return foundUser;
  }
}
