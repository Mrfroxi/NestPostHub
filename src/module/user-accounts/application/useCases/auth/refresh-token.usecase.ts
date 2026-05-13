import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from 'src/module/user-accounts/constants/auth-tokens.inject-constants';
import { DeviceSessionRepository } from 'src/module/user-accounts/infrastructure/device-session.repository';
import { DeviceSession } from 'src/module/user-accounts/domain/device-session.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class RefreshTokenCommand {
  constructor(
    public userId: string,
    public deviceId: string,
    public ip: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private deviceSessionRepository: DeviceSessionRepository,
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, deviceId, ip } = command;

    const session = await this.deviceSessionRepository.findByDeviceIdAndUserId(
      deviceId,
      userId,
    );
    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Session not found',
        extensions: [{ message: 'Session not found', field: 'refreshToken' }],
      });
    }

    await this.deviceSessionRepository.deleteById(session.id);

    const newAccessToken = this.accessTokenContext.sign({ userId, deviceId });
    const newRefreshToken = this.refreshTokenContext.sign({
      userId,
      deviceId,
    });

    const { exp } = this.refreshTokenContext.verify(newRefreshToken);

    const newSession = DeviceSession.create({
      deviceId,
      userId: userId,
      ip,
      refreshToken: newRefreshToken,
      expiresAt: exp,
    });
    await this.deviceSessionRepository.save(newSession);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
