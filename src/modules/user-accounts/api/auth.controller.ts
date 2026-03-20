import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import {
  ConfirmationCodeInputDto,
  ResendEmailInputDto,
} from './input-dto/resendEmail.input.dto';
import { NewPasswordInputDto } from './input-dto/new-password.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async createUser(
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
}
