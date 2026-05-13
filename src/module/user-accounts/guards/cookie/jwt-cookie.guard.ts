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
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

@Injectable()
export class JwtRefreshCookieGuard implements CanActivate {
  constructor(
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.refreshToken ?? null;

    if (!token) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Access token cookie not found',
        extensions: [
          { message: 'Access token cookie not found', field: 'token' },
        ],
      });
    }

    try {
      const payload = this.jwtService.verify<UserPayload>(token);
      (request as any).user = payload;
      return true;
    } catch {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid or expired access token',
        extensions: [
          { message: 'Invalid or expired access token', field: 'payload' },
        ],
      });
    }
  }
}
