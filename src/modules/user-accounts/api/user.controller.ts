import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { UsersQueryRepository } from '../infastructure/query/users.query-repository';
import { GetUsersQueryParams } from './input-dto/get-users-query.input-dto';
import { UserOutputDtoDto } from './output/users.output-dto';
import { BasicAuthGuard } from '../../../core/guards/basic-auth.guard';

@UseGuards(BasicAuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getAll(@Query() query: GetUsersQueryParams) {
    return this.userQueryRepository.getAll(query);
  }

  @Post()
  async createUser(
    @Body() createUserInputDto: CreateUserInputDto,
  ): Promise<UserOutputDtoDto> {
    const userId: string =
      await this.userService.registerAdminUser(createUserInputDto);

    return this.userQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
