import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { CreateUserDto } from '@src/module/user-accounts/dto/create-user.dto';
import { UsersRepository } from '@src/module/user-accounts/infrastructure/user.repository';
import { CreateUserCommand } from '@src/module/user-accounts/application/useCases/create-user.usecase';
import { UserRegisteredEvent } from '@src/module/notification/application/events-handlers/send-welcome-email.event-handler';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private commandBus: CommandBus,
    private eventBus: EventBus,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const userId: string = await this.commandBus.execute(
      new CreateUserCommand(dto),
    );

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `user not find`,
        extensions: [{ message: `user not find`, field: 'user' }],
      });
    }

    const confirmCode: string = crypto.randomUUID();

    this.eventBus.publish(
      new UserRegisteredEvent(user.email, user.login, confirmCode),
    );
  }
}
