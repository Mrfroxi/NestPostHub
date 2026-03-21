import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { DomainException } from '../../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../exceptions/domain-exception-codes';

@Injectable()
export class BasicConfigStrategy extends PassportStrategy(BasicStrategy) {
  validate(username: string, password: string): { username: string } {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (username === adminUsername && password === adminPassword) {
      return { username };
    }

    throw new DomainException({
      code: DomainExceptionCode.Unauthorized,
      extensions: [{ message: 'BasicStrategy', field: 'validate' }],
    });
  }
}
