import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmUserInputDto } from 'src/module/user-accounts/api/input-dto/confirm-user.input-dto';
import { UsersRepository } from 'src/module/user-accounts/infrastructure/user.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class ConfirmUserCommand {
  constructor(public dto: ConfirmUserInputDto) {}
}

@CommandHandler(ConfirmUserCommand)
export class ConfirmUserUseCase implements ICommandHandler<ConfirmUserCommand> {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ dto }: ConfirmUserCommand): Promise<void> {
    const user = await this.usersRepository.findByCode(dto.code);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `code dont find`,
        extensions: [{ message: `code dont find`, field: 'code' }],
      });
    }

    if (user.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `code already confirmed`,
        extensions: [{ message: `code already confirmed`, field: 'code' }],
      });
    }

    user.setConfirmed();
    await this.usersRepository.save(user);
  }
}
