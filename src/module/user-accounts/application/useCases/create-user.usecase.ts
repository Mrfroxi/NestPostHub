import { CreateUserDto } from '@src/module/user-accounts/dto/create-user.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '@src/module/user-accounts/infrastructure/user.repository';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private commandBus: CommandBus,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<void> {
    const { dto } = command;

    const validByEmail = await this.usersRepository.findByEmail(dto.email);

    if (validByEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'validByEmail is not unique',
        extensions: [
          { message: 'validByEmail is not unique', field: 'validByEmail' },
        ],
      });
    }

    const validByLogin = await this.usersRepository.findByLogin(dto.login);

    if (validByLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'validByLogin is not unique',
        extensions: [
          { message: 'validByLogin is not unique', field: 'validByLogin' },
        ],
      });
    }

    await this.usersRepository.create(dto.login, dto.email, dto.password);
  }
}
