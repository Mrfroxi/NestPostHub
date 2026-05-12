import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailService } from '@src/module/notification/application/email.service';
import { IEvent } from '@nestjs/cqrs';

export class RecoveryPasswordEvent implements IEvent {
  constructor(
    public readonly email: string,
    public readonly recoveryCode: string,
  ) {}
}

@EventsHandler(RecoveryPasswordEvent)
export class SendPasswordRecoveryEmail implements IEventHandler<RecoveryPasswordEvent> {
  constructor(private emailService: EmailService) {}

  async handle(event: RecoveryPasswordEvent): Promise<void> {
    await this.emailService.sendRecoveryPasswordEmail(
      event.email,
      event.recoveryCode,
    );
  }
}
