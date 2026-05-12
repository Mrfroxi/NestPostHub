import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationEmailResendingInputDto } from '@src/module/user-accounts/api/input-dto/registration-email-resending.input-dto';
import { UsersRepository } from '@src/module/user-accounts/infrastructure/user.repository';
import { UserRegisteredEvent } from '@src/module/notification/application/events-handlers/send-welcome-email.event-handler';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

export class RegistrationEmailResendingCommand {
  constructor(public dto: RegistrationEmailResendingInputDto) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase implements ICommandHandler<RegistrationEmailResendingCommand> {
  constructor(
    private eventBus: EventBus,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ dto }: RegistrationEmailResendingCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `user not find`,
        extensions: [{ message: `user not find`, field: 'user' }],
      });
    }

    const newCode: string = crypto.randomUUID();

    user.changeConfirmationCode(newCode);

    await this.usersRepository.save(user);

    this.eventBus.publish(
      new UserRegisteredEvent(user.email, user.login, user.confirmCode),
    );
  }
}
