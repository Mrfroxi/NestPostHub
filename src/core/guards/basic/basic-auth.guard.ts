import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { DomainException } from '../../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../exceptions/domain-exception-codes';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  private readonly validUsername = process.env.ADMIN_USERNAME;
  private readonly validPassword = process.env.ADMIN_PASSWORD;

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      'IS_PUBLIC_KEY',
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) {
      return true;
    }

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        extensions: [{ message: 'authHeader not found', field: 'authHeader' }],
      });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf-8',
    );
    const [username, password] = credentials.split(':');

    if (username === this.validUsername && password === this.validPassword) {
      return true;
    } else {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        extensions: [{ message: 'user unauthorized', field: 'username' }],
      });
    }
  }
}
