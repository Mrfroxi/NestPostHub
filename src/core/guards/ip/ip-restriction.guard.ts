import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { DomainException } from '../../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../exceptions/domain-exception-codes';

function normalizeIp(ip: string): string {
  if (ip === '::ffff:127.0.0.1' || ip === '127.0.0.1') {
    return '127.0.0.1';
  }

  return ip.replace(/^::ffff:/, '');
}

function getClientIp(request: Request): string {
  const forwarded = request.headers['x-forwarded-for'];
  const forwardedIp =
    typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '';

  return normalizeIp(
    forwardedIp || request.socket.remoteAddress || request.ip || 'unknown',
  );
}

@Injectable()
export class IpRestrictionGuard implements CanActivate {
  private readonly allowedIps: Set<string>;

  constructor() {
    const raw = process.env.AUTH_LOGIN_ALLOWED_IPS ?? '';
    this.allowedIps = new Set(
      raw
        .split(',')
        .map((ip) => ip.trim())
        .filter(Boolean)
        .map(normalizeIp),
    );
  }

  canActivate(context: ExecutionContext): boolean {
    if (this.allowedIps.size === 0) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest<Request>();
    const clientIp = getClientIp(request);

    if (this.allowedIps.has(clientIp)) {
      return true;
    }

    throw new DomainException({
      code: DomainExceptionCode.Forbidden,
      extensions: [{ message: 'IP address is not allowed', field: 'ip' }],
    });
  }
}


