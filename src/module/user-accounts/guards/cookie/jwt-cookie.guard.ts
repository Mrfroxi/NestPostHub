import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from '@src/module/user-accounts/constants/auth-tokens.inject-constants';
import type { UserPayload } from '@core/decorators/current-user.decorator';
import { DeviceSessionRepository } from '@src/module/user-accounts/infrastructure/device-session.repository';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

@Injectable()
export class JwtRefreshCookieGuard implements CanActivate {
  constructor(
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private jwtService: JwtService,
    private deviceSessionRepository: DeviceSessionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token: string = request.cookies?.refreshToken ?? null;

    if (!token) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Access token cookie not found',
        extensions: [
          { message: 'Access token cookie not found', field: 'token' },
        ],
      });
    }

    let payload: UserPayload;
    try {
      payload = this.jwtService.verify<UserPayload>(token);
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid or expired access token',
        extensions: [
          { message: 'Invalid or expired access token', field: 'payload' },
        ],
      });
    }

    const session = await this.deviceSessionRepository.validateSession(
      payload.deviceId,
      payload.userId,
      token,
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

    (request as any).user = payload;
    return true;
  }
}
