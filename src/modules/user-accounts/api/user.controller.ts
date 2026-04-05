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
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { UsersQueryRepository } from '../infastructure/query/users.query-repository';
import { GetUsersQueryParams } from './input-dto/get-users-query.input-dto';
import { UserOutputDtoDto } from './output/users.output-dto';
import { BasicAuthGuard } from '../../../core/guards/basic/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateAdminUserCommand } from '../application/useCases/user/create-user-command';
import { DeleteUserCommand } from '../application/useCases/user/delete-user-command';
import { UserIdParamDto } from './input-dto/user-id-param.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getAll(@Query() query: GetUsersQueryParams) {
    return this.userQueryRepository.getAll(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createAdminUser(
    @Body() createUserInputDto: CreateUserInputDto,
  ): Promise<UserOutputDtoDto> {
    const userId: string = await this.commandBus.execute(
      new CreateAdminUserCommand(createUserInputDto),
    );

    return this.userQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param() params: UserIdParamDto): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommand(params.id));
  }
}
