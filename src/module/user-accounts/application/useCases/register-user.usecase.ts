// import {
//   CommandBus,
//   CommandHandler,
//   EventBus,
//   ICommandHandler,
// } from '@nestjs/cqrs';
// import { CreateUserDto } from '@src/module/user-accounts/dto/create-user.dto';
// import { UsersRepository } from '@src/module/user-accounts/infrastructure/user.repository';
//
// export class RegisterUserCommand {
//   constructor(public dto: CreateUserDto) {}
// }
//
// @CommandHandler(RegisterUserCommand)
// export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
//   constructor(
//     private commandBus: CommandBus,
//     private eventBus: EventBus,
//     private usersRepository: UsersRepository,
//   ) {}
//
//   async execute({ dto }: RegisterUserCommand): Promise<void> {}
// }
