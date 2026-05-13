import { CreateUserDto } from 'src/module/user-accounts/dto/create-user.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from 'src/module/user-accounts/infrastructure/user.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { PasswordHashService } from 'src/core/services/password-hash.service';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private commandBus: CommandBus,
    private usersRepository: UsersRepository,
    private passwordHashService: PasswordHashService,
  ) {}

  private async validateUniqueness(
    value: string,
    field: 'email' | 'login',
  ): Promise<void> {
    const existing =
      field === 'email'
        ? await this.usersRepository.findByEmail(value)
        : await this.usersRepository.findByLogin(value);

    if (existing) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `${field} is not unique`,
        extensions: [{ message: `${field} is not unique`, field }],
      });
    }
  }

  async execute(command: CreateUserCommand): Promise<string> {
    const { dto } = command;

    await this.validateUniqueness(dto.email, 'email');
    await this.validateUniqueness(dto.login, 'login');

    const passwordHash = await this.passwordHashService.hash(dto.password);
    const createdUser = await this.usersRepository.create(
      dto.login,
      dto.email,
      passwordHash,
    );

    return createdUser.id;
  }
}
