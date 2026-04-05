import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordInputDto } from '../../../api/input-dto/new-password.input-dto';
import { UserDocument } from '../../../domain/user.entity';
import { UsersRepository } from '../../../infastructure/users.repository';
import { Argon2Service } from '../../../../../core/external-service/argon2.service';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class NewPasswordCommand {
  constructor(public dto: NewPasswordInputDto) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private userRepository: UsersRepository,
    private argon2Service: Argon2Service,
  ) {}

  async execute({ dto }: NewPasswordCommand): Promise<void> {
    const userByRecoveryCode: UserDocument | null =
      await this.userRepository.findByRecoveryCode(dto.recoveryCode);

    if (!userByRecoveryCode) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            message: 'Recovery code is incorrect or expired',
            field: 'recoveryCode',
          },
        ],
      });
    }

    const passwordHash = await this.argon2Service.hashPassword(dto.newPassword);

    userByRecoveryCode.updatePassword(passwordHash);
    userByRecoveryCode.clearRecoveryCode();

    await this.userRepository.save(userByRecoveryCode);
  }
}
