import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceSessionRepository } from '@src/module/user-accounts/infrastructure/device-session.repository';

export class LogoutCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(private deviceSessionRepository: DeviceSessionRepository) {}

  async execute(command: LogoutCommand): Promise<void> {
    await this.deviceSessionRepository.deleteByDeviceIdAndUserId(
      command.deviceId,
      command.userId,
    );
  }
}
