import { configModule } from '@src/config-dynamic-module';
import { CoreConfig } from '@core/core.config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from '@core/core.module';
import { UserAccountsModule } from '@src/module/user-accounts/user-accounts.module';
import { NotificationsModule } from '@src/module/notification/notifications.module';
import { AllHttpExceptionsFilter } from '@core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from '@core/exceptions/filters/domain-exceptions.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    configModule,
    CoreModule,
    UserAccountsModule,
    NotificationsModule,
    TypeOrmModule.forRootAsync({
      useFactory: (config: CoreConfig) => ({
        type: 'postgres',
        host: config.host,
        port: config.dbPort,
        username: config.username,
        password: config.password,
        database: config.dbName,
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [CoreConfig],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {}
