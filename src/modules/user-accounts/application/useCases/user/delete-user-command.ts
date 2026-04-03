import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infastructure/users.repository';
import { UserDocument } from '../../../domain/user.entity';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private userRepository: UsersRepository) {}

  async execute({ id }: DeleteUserCommand): Promise<void> {
    const user: UserDocument = await this.userRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.userRepository.save(user);
  }
}
