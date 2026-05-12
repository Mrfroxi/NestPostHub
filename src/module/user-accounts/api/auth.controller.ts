import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthQueryRepository } from '@src/module/user-accounts/infrastructure/query/auth.query-repository';
import { CreateUserInputDto } from '@src/module/user-accounts/api/input-dto/create-user.input-dto';
import { RegisterUserCommand } from '@src/module/user-accounts/application/useCases/register-user.usecase';
import { ConfirmUserInputDto } from '@src/module/user-accounts/api/input-dto/confirm-user.input-dto';
import { ConfirmUserCommand } from '@src/module/user-accounts/application/useCases/confirm-user.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private authQueryRepository: AuthQueryRepository,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  registration(@Body() body: CreateUserInputDto) {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  registrationConfirmation(@Body() body: ConfirmUserInputDto) {
    return this.commandBus.execute(new ConfirmUserCommand(body));
  }
}
