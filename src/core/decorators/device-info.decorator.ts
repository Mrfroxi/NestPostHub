import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

function normalizeIp(ip: string): string {
  // IPv4 loopback
  if (ip === '::ffff:127.0.0.1' || ip === '127.0.0.1') {
    return '127.0.0.1';
  }
  // Remove IPv6 prefix if present
  return ip.replace(/^::ffff:/, '');
}

export interface DeviceInfo {
  userAgent: string;
  ip: string;
  deviceId: string;
}

/**
 * Decorator that extracts device information from the request
 * @returns DeviceInfo object with userAgent, ip, and deviceId
 */
export const DeviceInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): DeviceInfo => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const userAgent: string = request.headers['user-agent'] || 'bad user-agent';

    const ip: string = normalizeIp(
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        request.socket.remoteAddress ||
        request.ip ||
        'unknown',
    );

    const deviceId: string = crypto.randomUUID();

    return { userAgent, ip, deviceId };
  },
);
