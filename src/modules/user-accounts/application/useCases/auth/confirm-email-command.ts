import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmationCodeInputDto } from '../../../api/input-dto/resendEmail.input.dto';
import { UserDocument } from '../../../domain/user.entity';
import { UsersRepository } from '../../../infastructure/users.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class ConfirmEmailCommand {
  constructor(public dto: ConfirmationCodeInputDto) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand> {
  constructor(private userRepository: UsersRepository) {}

  async execute({ dto }: ConfirmEmailCommand): Promise<void> {
    const userByCode: UserDocument | null =
      await this.userRepository.findByCode(dto.code);

    if (!userByCode) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            message: 'User with the same code not found',
            field: 'code',
          },
        ],
      });
    }

    if (userByCode.getIsEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            message: 'User with the same code confirmed',
            field: 'isConfirmed',
          },
        ],
      });
    }

    userByCode.makeEmailConfirmed();
    await this.userRepository.save(userByCode);
  }
}
