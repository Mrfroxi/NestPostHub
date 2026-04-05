import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infastructure/users.repository';
import { UsersFactory } from '../../factories/users-factory';
import { UserDocument } from '../../../domain/user.entity';
import { CreateUserInputDto } from '../../../api/input-dto/create-user.input-dto';

export class CreateAdminUserCommand {
  constructor(public dto: CreateUserInputDto) {}
}

@CommandHandler(CreateAdminUserCommand)
export class CreateAdminUserUseCase implements ICommandHandler<CreateAdminUserCommand> {
  constructor(
    private userRepository: UsersRepository,
    private usersFactory: UsersFactory,
  ) {}

  async execute({ dto }: CreateAdminUserCommand) {
    const user: UserDocument = await this.usersFactory.create(dto);

    user.makeEmailConfirmed();

    await this.userRepository.save(user);

    return user.getId;
  }
}
