import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordInputDto } from '../../../api/input-dto/password.input-dto';
import { UsersRepository } from 'src/module/user-accounts/infrastructure/user.repository';
import { PasswordHashService } from 'src/core/services/password-hash.service';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class NewPasswordCommand {
  constructor(public dto: PasswordInputDto) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private passwordHashService: PasswordHashService,
  ) {}

  async execute({ dto }: NewPasswordCommand): Promise<void> {
    const user = await this.usersRepository.findByRecoveryCode(
      dto.recoveryCode,
    );

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recovery code is incorrect or expired',
        extensions: [
          {
            message: 'Recovery code is incorrect or expired',
            field: 'recoveryCode',
          },
        ],
      });
    }

    const passwordHash = await this.passwordHashService.hash(dto.newPassword);
    user.updatePasswordHash(passwordHash);
    await this.usersRepository.save(user);
  }
}
