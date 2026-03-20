import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import {
  ConfirmationCodeInputDto,
  ResendEmailInputDto,
} from './input-dto/resendEmail.input.dto';

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
}
