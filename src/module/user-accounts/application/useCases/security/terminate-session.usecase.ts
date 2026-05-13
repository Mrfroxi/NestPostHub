import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceSessionRepository } from '@src/module/user-accounts/infrastructure/device-session.repository';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

export class TerminateSessionCommand {
  constructor(
    public deviceId: string,
    public currentUserId: string,
  ) {}
}

@CommandHandler(TerminateSessionCommand)
export class TerminateSessionUseCase implements ICommandHandler<TerminateSessionCommand> {
  constructor(private deviceSessionRepository: DeviceSessionRepository) {}

  async execute(command: TerminateSessionCommand): Promise<void> {
    const { deviceId, currentUserId } = command;

    const session = await this.deviceSessionRepository.findByDeviceId(deviceId);
    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
        extensions: [{ message: 'Session not found', field: 'deviceId' }],
      });
    }

    if (session.userId !== currentUserId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Cannot delete another user session',
        extensions: [
          { message: 'Cannot delete another user session', field: 'deviceId' },
        ],
      });
    }

    await this.deviceSessionRepository.deleteById(session.id);
  }
}
