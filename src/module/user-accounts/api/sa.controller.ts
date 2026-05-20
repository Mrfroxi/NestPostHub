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
import { CommandBus } from '@nestjs/cqrs';
import { SABasicAuthGuard } from '@src/module/user-accounts/guards/sa/sa-basic-auth.guard';
import { CreateUserInputDto } from '@src/module/user-accounts/api/input-dto/create-user.input-dto';
import { GetUsersQueryInputDto } from '@src/module/user-accounts/api/input-dto/get-users-query.input-dto';
import { CreateUserCommand } from '../application/useCases/auth/create-user.usecase';
import { UsersRepository } from '@src/module/user-accounts/infrastructure/user.repository';
import { AuthQueryRepository } from '@src/module/user-accounts/infrastructure/query/auth.query-repository';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';
import { DeleteUserDto } from '@src/module/user-accounts/api/input-dto/param.input-dto';

@Controller('sa')
export class SaController {
  constructor(
    private commandBus: CommandBus,
    private usersRepository: UsersRepository,
    private authQueryRepository: AuthQueryRepository,
  ) {}

  @UseGuards(SABasicAuthGuard)
  @Get('users')
  async getUsers(@Query() query: GetUsersQueryInputDto): Promise<{
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: { id: string; login: string; email: string; createdAt: string }[];
  }> {
    return this.authQueryRepository.getUsersPaginated(query);
  }

  @UseGuards(SABasicAuthGuard)
  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() body: CreateUserInputDto,
  ): Promise<{ id: string; login: string; email: string; createdAt: string }> {
    const userId: string = await this.commandBus.execute(
      new CreateUserCommand(body),
    );

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'User not found after creation',
        extensions: [
          { message: 'User not found after creation', field: 'userId' },
        ],
      });
    }

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }

  @UseGuards(SABasicAuthGuard)
  @Delete('/users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') param: DeleteUserDto): Promise<void> {
    const user = await this.usersRepository.findById(param.id);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        extensions: [{ message: 'User not found', field: 'id' }],
      });
    }

    await this.usersRepository.deleteById(param.id);
  }
}
