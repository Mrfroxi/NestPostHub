import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';
import { UserAccountsConfig } from '@src/module/user-accounts/config/user-accounts.config';

@Injectable()
export class SABasicAuthGuard implements CanActivate {
  constructor(private userAccountsConfig: UserAccountsConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
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
      login !== this.userAccountsConfig.adminLogin ||
      password !== this.userAccountsConfig.adminPassword
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
