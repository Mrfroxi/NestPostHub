import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserInputDto } from '@src/module/user-accounts/api/input-dto/create-user.input-dto';
import { CreateUserCommand } from '../application/useCases/auth/create-user.usecase';
import { UsersRepository } from '@src/module/user-accounts/infrastructure/user.repository';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

@Controller()
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private usersRepository: UsersRepository,
  ) {}

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
}
