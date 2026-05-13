import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceSessionRepository } from '@src/module/user-accounts/infrastructure/device-session.repository';

export class TerminateOtherSessionsCommand {
  constructor(
    public userId: string,
    public currentDeviceId: string,
  ) {}
}

@CommandHandler(TerminateOtherSessionsCommand)
export class TerminateOtherSessionsUseCase implements ICommandHandler<TerminateOtherSessionsCommand> {
  constructor(private deviceSessionRepository: DeviceSessionRepository) {}

  async execute(command: TerminateOtherSessionsCommand): Promise<void> {
    await this.deviceSessionRepository.deleteAllByUserIdExcept(
      command.userId,
      command.currentDeviceId,
    );
  }
}
