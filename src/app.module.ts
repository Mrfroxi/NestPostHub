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
import { MailerModule } from '@nestjs-modules/mailer';
import { GuardsModule } from './core/guards/guards.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    UserAccountsModule,
    TestingModule,
    BlogPlatformModule,
    GuardsModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASS,
        },
      },
    }),
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
