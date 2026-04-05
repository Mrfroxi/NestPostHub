import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResendEmailInputDto } from '../../../api/input-dto/resendEmail.input.dto';
import { UserDocument } from '../../../domain/user.entity';
import { UsersRepository } from '../../../infastructure/users.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { EmailService } from '../../../../notifications/email.service';

export class ResendEmailCommand {
  constructor(public dto: ResendEmailInputDto) {}
}

@CommandHandler(ResendEmailCommand)
export class ResendEmailUseCase implements ICommandHandler<ResendEmailCommand> {
  constructor(
    private userRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute({ dto }: ResendEmailCommand): Promise<void> {
    const userByEmail: UserDocument | null =
      await this.userRepository.findByEmail(dto.email);

    if (!userByEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [{ message: 'Email not found', field: 'email' }],
      });
    }

    if (userByEmail.getIsEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            message: 'User with the same email already confirmed',
            field: 'email',
          },
        ],
      });
    }

    const confirmationCode: string = crypto.randomUUID();
    userByEmail.setConfirmationCode(confirmationCode);

    await this.userRepository.save(userByEmail);

    void this.emailService.sendConfirmationEmail(dto.email, confirmationCode);
  }
}
