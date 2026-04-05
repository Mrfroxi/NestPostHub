import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryInputDto } from '../../../api/input-dto/password-recovery.input-dto';
import { UserDocument } from '../../../domain/user.entity';
import { UsersRepository } from '../../../infastructure/users.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { EmailService } from '../../../../notifications/email.service';

export class PasswordRecoveryCommand {
  constructor(public dto: PasswordRecoveryInputDto) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<PasswordRecoveryCommand> {
  constructor(
    private userRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute({ dto }: PasswordRecoveryCommand): Promise<void> {
    const userByEmail: UserDocument | null =
      await this.userRepository.findByEmail(dto.email);

    if (!userByEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            message: 'Email not found',
            field: 'email',
          },
        ],
      });
    }

    const recoveryCode: string = crypto.randomUUID();
    userByEmail.setRecoveryCode(recoveryCode);

    await this.userRepository.save(userByEmail);

    void this.emailService.sendRecoveryPassword(dto.email, recoveryCode);
  }
}
