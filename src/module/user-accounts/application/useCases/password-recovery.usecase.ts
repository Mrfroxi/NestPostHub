import { PasswordRecoveryDto } from '@src/module/user-accounts/api/input-dto/password.input-dto';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '@src/module/user-accounts/infrastructure/user.repository';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';
import { RecoveryPasswordEvent } from '@src/module/notification/application/events-handlers/send-recovery-password.event-handler';

export class PasswordRecoveryCommand {
  constructor(public dto: PasswordRecoveryDto) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryEmailUseCase implements ICommandHandler<PasswordRecoveryCommand> {
  constructor(
    private eventBus: EventBus,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ dto }: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `user not find`,
        extensions: [{ message: `user not find`, field: 'user' }],
      });
    }

    const newRecoveryCode: string = crypto.randomUUID();

    user.setRecoveryCode(newRecoveryCode);
    await this.usersRepository.save(user);

    this.eventBus.publish(
      new RecoveryPasswordEvent(user.email, newRecoveryCode),
    );
  }
}
