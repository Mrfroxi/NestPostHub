import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreConfig } from './core.config';
import { PasswordHashService } from './services/password-hash.service';

//global module for providers and modules needed in all parts of the application (e.g. LoggerService, CqrsModule, etc...)
@Global()
@Module({
  imports: [CqrsModule],
  exports: [CoreConfig, CqrsModule, PasswordHashService],
  providers: [CoreConfig, PasswordHashService],
})
export class CoreModule {}
