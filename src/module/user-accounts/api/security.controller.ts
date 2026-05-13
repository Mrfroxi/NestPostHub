import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtRefreshCookieGuard } from '@src/module/user-accounts/guards/cookie/jwt-cookie.guard';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import type { UserPayload } from '@core/decorators/current-user.decorator';
import { TerminateSessionCommand } from '../application/useCases/security/terminate-session.usecase';
import { TerminateOtherSessionsCommand } from '../application/useCases/security/terminate-other-sessions.usecase';
import { AuthQueryRepository } from '@src/module/user-accounts/infrastructure/query/auth.query-repository';

@Controller('security')
export class SecurityController {
  constructor(
    private commandBus: CommandBus,
    private authQueryRepository: AuthQueryRepository,
  ) {}

  @UseGuards(JwtRefreshCookieGuard)
  @Get('devices')
  @HttpCode(HttpStatus.OK)
  async getDevices(
    @CurrentUser() user: UserPayload,
  ): Promise<
    { ip: string; title: string; lastActiveDate: string; deviceId: string }[]
  > {
    return this.authQueryRepository.getSessionsByUserId(user.userId);
  }

  @UseGuards(JwtRefreshCookieGuard)
  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateSession(
    @Param('deviceId') deviceId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<void> {
    await this.commandBus.execute(
      new TerminateSessionCommand(deviceId, user.userId),
    );
  }

  @UseGuards(JwtRefreshCookieGuard)
  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateOtherSessions(
    @CurrentUser() user: UserPayload,
  ): Promise<void> {
    await this.commandBus.execute(
      new TerminateOtherSessionsCommand(user.userId, user.deviceId),
    );
  }
}
