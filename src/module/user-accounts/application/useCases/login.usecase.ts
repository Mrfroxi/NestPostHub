import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '@src/module/user-accounts/infrastructure/user.repository';
import { DeviceSessionRepository } from '@src/module/user-accounts/infrastructure/device-session.repository';
import { PasswordHashService } from '@core/services/password-hash.service';
import { JwtService } from '@nestjs/jwt';
import { DomainException } from '@core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@core/exceptions/domain-exception-codes';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '@src/module/user-accounts/constants/auth-tokens.inject-constants';
import { Inject } from '@nestjs/common';
import { DeviceSession } from '@src/module/user-accounts/domain/device-session.entity';

export class LoginCommand {
  constructor(
    public loginOrEmail: string,
    public password: string,
    public ip: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private deviceSessionRepository: DeviceSessionRepository,
    private passwordHashService: PasswordHashService,
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { loginOrEmail, password, ip } = command;

    const user =
      (await this.usersRepository.findByLogin(loginOrEmail)) ??
      (await this.usersRepository.findByEmail(loginOrEmail));

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid credentials',
        extensions: [{ message: `Invalid credentials`, field: 'user' }],
      });
    }

    const isPasswordValid = await this.passwordHashService.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid credentials',
        extensions: [
          { message: `Invalid credentials`, field: 'isPasswordValid' },
        ],
      });
    }

    const deviceId = crypto.randomUUID();

    const accessToken = this.accessTokenContext.sign({
      userId: user.id,
      deviceId,
    });

    const refreshToken = this.refreshTokenContext.sign({
      userId: user.id,
      deviceId,
    });

    const { exp } = this.refreshTokenContext.verify(refreshToken);

    const session = DeviceSession.create({
      deviceId,
      userId: user.id,
      ip,
      refreshToken,
      expiresAt: exp,
    });

    await this.deviceSessionRepository.save(session);

    return { accessToken, refreshToken };
  }
}
