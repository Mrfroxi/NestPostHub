import { Module } from '@nestjs/common';
import { EmailService } from '@src/module/notification/application/email.service';
import { NotificationConfig } from '@src/module/notification/config/notification.config';
import { SendWelcomeEmailEventHandler } from '@src/module/notification/application/events-handlers/send-welcome-email.event-handler';
import { SendPasswordRecoveryEmail } from '@src/module/notification/application/events-handlers/send-recovery-password.event-handler';

@Module({
  providers: [
    NotificationConfig,
    EmailService,
    SendWelcomeEmailEventHandler,
    SendPasswordRecoveryEmail,
  ],
})
export class NotificationsModule {}
