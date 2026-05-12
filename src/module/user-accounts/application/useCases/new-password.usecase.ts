import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordInputDto } from '@src/module/user-accounts/api/input-dto/new-password.input-dto';
import { UsersRepository } from '@src/module/user-accounts/infrastructure/user.repository';
import { PasswordHashService } from '@core/services/password-hash.service';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

export class NewPasswordCommand {
  constructor(public dto: NewPasswordInputDto) {}
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
