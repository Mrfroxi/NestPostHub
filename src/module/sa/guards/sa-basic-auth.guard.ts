import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';
import { SaConfig } from '@src/module/sa/config/sa.config';

@Injectable()
export class SABasicAuthGuard implements CanActivate {
  constructor(private saConfig: SaConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
        // extensions: [{ message: `Unauthorized`, field: 'Basic' }],
      });
    }

    const base64 = authHeader.slice(6);
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const colonIdx = decoded.indexOf(':');

    if (colonIdx === -1) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
        extensions: [{ message: `Unauthorized`, field: 'colonIdx' }],
      });
    }

    const login = decoded.substring(0, colonIdx);
    const password = decoded.substring(colonIdx + 1);

    if (
      login !== this.saConfig.adminLogin ||
      password !== this.saConfig.adminPassword
    ) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
        extensions: [{ message: `Unauthorized`, field: 'login or password' }],
      });
    }

    return true;
  }
}
