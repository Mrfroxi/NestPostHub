import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LoginInputDto } from '../../../api/input-dto/login.input-dto';
import { UsersRepository } from '../../../infastructure/users.repository';
import { Argon2Service } from '../../../../../core/external-service/argon2.service';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../../../constants/auth-tokens.inject-constants';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class LoginCommand {
  constructor(public dto: LoginInputDto) {}
}

export interface LoginResult {
  accessToken: string;
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<
  LoginCommand,
  LoginResult
> {
  constructor(
    private usersRepository: UsersRepository,
    private argon2Service: Argon2Service,
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private jwtService: JwtService,
  ) {}

  async execute({ dto }: LoginCommand): Promise<LoginResult> {
    const user = await this.usersRepository.findByLoginOrEmail(
      dto.loginOrEmail,
    );

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
      dto.password,
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

    const accessToken = this.jwtService.sign({
      login: user.login,
      userId: user.getId,
    });

    return { accessToken };
  }
}
