import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { ResendEmailInputDto } from './input-dto/resendEmail.input.dto';

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
}
