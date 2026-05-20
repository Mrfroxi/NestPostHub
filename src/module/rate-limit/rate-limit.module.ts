import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateLimitAttempt } from '@src/module/rate-limit/domain/rate-limit-attempt.entity';
import { RateLimitRepository } from '@src/module/rate-limit/infrastructure/rate-limit.repository';
import { RateLimitGuard } from '@src/module/rate-limit/guards/rate-limit.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([RateLimitAttempt])],
  providers: [RateLimitRepository, RateLimitGuard],
  exports: [RateLimitRepository, RateLimitGuard],
})
export class RateLimitModule {}
