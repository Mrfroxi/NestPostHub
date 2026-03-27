import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import {
  ConfirmationCodeInputDto,
  ResendEmailInputDto,
} from './input-dto/resendEmail.input.dto';
import { NewPasswordInputDto } from './input-dto/new-password.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';
import { LoginInputDto } from './input-dto/login.input-dto';
import { AuthService } from '../application/auth.service';
import { JwtAuthGuard } from '../../../core/guards/jwt/jwt-auth.guard';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registerUser(
    @Body() createUserInputDto: CreateUserInputDto,
  ): Promise<void> {
    await this.userService.registerUser(createUserInputDto);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendEmail(
    @Body() resendEmailCodeInputDto: ResendEmailInputDto,
  ): Promise<void> {
    await this.userService.resendEmailCode(resendEmailCodeInputDto);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmationUser(
    @Body() code: ConfirmationCodeInputDto,
  ): Promise<void> {
    await this.userService.confirmationUser(code);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() dto: PasswordRecoveryInputDto): Promise<void> {
    await this.userService.passwordRecovery(dto);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() dto: NewPasswordInputDto): Promise<void> {
    await this.userService.newPassword(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginInputDto) {
    const user = await this.authService.validateUser(
      dto.loginOrEmail,
      dto.password,
    );

    return this.authService.login(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: { login: string }) {
    return this.authService.getCurrentUser(user.login);
  }
}
