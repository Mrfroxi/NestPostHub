import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import {
  RateLimitAttempt,
  RateLimitStatus,
} from '@src/module/rate-limit/domain/rate-limit-attempt.entity';

@Injectable()
export class RateLimitRepository {
  constructor(
    @InjectRepository(RateLimitAttempt)
    private readonly repo: Repository<RateLimitAttempt>,
  ) {}

  async countAttemptsInWindow(
    ip: string,
    endpoint: string,
    windowMs: number,
  ): Promise<number> {
    const since = new Date(Date.now() - windowMs);
    return this.repo.count({
      where: {
        ipAddress: ip,
        endpoint: endpoint,
        createdAt: MoreThanOrEqual(since),
      },
    });
  }

  async logAttempt(
    ip: string,
    endpoint: string,
    status: RateLimitStatus,
  ): Promise<void> {
    const attempt = this.repo.create({
      ipAddress: ip,
      endpoint,
      status,
    });
    await this.repo.save(attempt);
  }
}
