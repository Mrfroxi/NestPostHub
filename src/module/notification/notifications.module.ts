import { Module } from '@nestjs/common';
import { EmailService } from '@src/module/notification/application/email.service';
import { NotificationConfig } from '@src/module/notification/config/notification.config';
import { SendWelcomeEmailEventHandler } from '@src/module/notification/application/events-handlers/send-welcome-email.event-handler';

@Module({
  providers: [NotificationConfig, EmailService, SendWelcomeEmailEventHandler],
})
export class NotificationsModule {}
