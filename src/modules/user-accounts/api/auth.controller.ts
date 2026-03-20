import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}
  @Post('registration')
  async createUser(
    @Body() createUserInputDto: CreateUserInputDto,
  ): Promise<void> {
    await this.userService.createUser(createUserInputDto);
  }
}
