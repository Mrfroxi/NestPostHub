import { EmailService } from '../../src/modules/notifications/email.service';
import { emailExamples } from '../../src/core/helpers/email-template';

export class EmailServiceMock extends EmailService {

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    console.log('Call mock method sendConfirmationEmail / EmailServiceMock');

    return;
  }

  async sendRecoveryPassword(email: string, code: string): Promise<void> {
    console.log('Call mock method sendRecoveryPassword / EmailServiceMock');

    return;
  }
}
