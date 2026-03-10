import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { UsersQueryRepository } from '../infastructure/query/users.query-repository';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userQueryRepository: UsersQueryRepository,
  ) {}

  @Post()
  async createUser(@Body() createUserInputDto: CreateUserInputDto) {
    const userId: string =
      await this.userService.createAdminUser(createUserInputDto);

    return this.userQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
