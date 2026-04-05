import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputDto } from '../../../api/input-dto/create-user.input-dto';
import { UserDocument } from '../../../domain/user.entity';
import { UsersRepository } from '../../../infastructure/users.repository';
import { UsersFactory } from '../../factories/users-factory';
import { EmailService } from '../../../../notifications/email.service';

export class RegisterUserCommand {
  constructor(public dto: CreateUserInputDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private userRepository: UsersRepository,
    private usersFactory: UsersFactory,
    private emailService: EmailService,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const user: UserDocument = await this.usersFactory.create(dto);

    const confirmationCode: string = crypto.randomUUID();
    user.setConfirmationCode(confirmationCode);

    await this.userRepository.save(user);

    void this.emailService.sendConfirmationEmail(dto.email, confirmationCode);
  }
}
