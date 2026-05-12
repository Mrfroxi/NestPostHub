import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountsConfig } from '@src/module/user-accounts/config/user-accounts.config';
import { User } from '@src/module/user-accounts/domain/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [UserAccountsConfig],
})
export class UserAccountsModule {}
