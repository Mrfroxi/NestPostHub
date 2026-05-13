import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';
import { DeviceSessionRepository } from '@src/module/user-accounts/infrastructure/device-session.repository';
import type { UserPayload } from '@core/decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private deviceSessionRepository: DeviceSessionRepository) {
    super();
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
        extensions: [{ message: 'Unauthorized', field: 'AuthGuard' }],
      });
    }
    return user;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const can = await super.canActivate(context);
    if (!can) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserPayload;

    const session = await this.deviceSessionRepository.findByDeviceIdAndUserId(
      user.deviceId,
      user.userId,
    );

    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Session not found',
        extensions: [
          { message: 'Session not found or expired', field: 'deviceId' },
        ],
      });
    }

    return true;
  }
}
