import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RateLimitRepository } from '@src/module/rate-limit/infrastructure/rate-limit.repository';
import { RateLimitStatus } from '@src/module/rate-limit/domain/rate-limit-attempt.entity';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10_000;

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly rateLimitRepo: RateLimitRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const endpoint = request.originalUrl;

    const attemptCount = await this.rateLimitRepo.countAttemptsInWindow(
      ip,
      endpoint,
      WINDOW_MS,
    );

    if (attemptCount >= MAX_ATTEMPTS) {
      await this.rateLimitRepo.logAttempt(
        ip,
        endpoint,
        RateLimitStatus.Blocked,
      );
      throw new DomainException({
        code: DomainExceptionCode.TooManyRequests,
        message: 'Too many requests',
        extensions: [{ message: 'Too many requests', field: 'rateLimit' }],
      });
    }

    await this.rateLimitRepo.logAttempt(ip, endpoint, RateLimitStatus.Allowed);
    return true;
  }
}
