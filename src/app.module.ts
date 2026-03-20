import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { TestingModule } from './modules/testing/testing.module';
import { BlogPlatformModule } from './modules/blogPlatform/blog-platform.module';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    UserAccountsModule,
    TestingModule,
    BlogPlatformModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_FILTER',
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: 'APP_FILTER',
      useClass: DomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {}
