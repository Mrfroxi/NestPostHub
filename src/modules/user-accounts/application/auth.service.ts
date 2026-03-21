import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infastructure/users.repository';
import { Argon2Service } from '../../../core/external-service/argon2.service';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private argon2Service: Argon2Service,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginOrEmail: string, password: string) {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        extensions: [
          {
            message: 'Invalid login or password',
            field: 'loginOrPassword',
          },
        ],
      });
    }

    const isPasswordValid = await this.argon2Service.verifyPassword(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        extensions: [
          {
            message: 'Invalid login or password',
            field: 'loginOrPassword',
          },
        ],
      });
    }

    return { login: user.login };
  }

  async login(user: { login: string }) {
    const accessToken = this.jwtService.sign({
      login: user.login,
    });

    return { accessToken };
  }
}
