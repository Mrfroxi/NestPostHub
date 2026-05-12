import { Module } from '@nestjs/common';
import { UserAccountsConfig } from '@src/module/user-accounts/config/user-accounts.config';

@Module({
  imports: [],
  controllers: [],
  providers: [UserAccountsConfig],
})
export class UserAccountsModule {}
