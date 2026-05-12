import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailService } from '@src/module/notification/application/email.service';
import { IEvent } from '@nestjs/cqrs';

export class UserRegisteredEvent implements IEvent {
  constructor(
    public readonly email: string,
    public readonly login: string,
    public readonly confirmCode: string,
  ) {}
}

@EventsHandler(UserRegisteredEvent)
export class SendWelcomeEmailEventHandler implements IEventHandler<UserRegisteredEvent> {
  constructor(private emailService: EmailService) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    await this.emailService.sendWelcomeEmail(
      event.email,
      event.login,
      event.confirmCode,
    );
  }
}
