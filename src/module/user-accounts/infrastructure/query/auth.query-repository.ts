import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '@src/module/user-accounts/domain/user.entity';

@Injectable()
export class AuthQueryRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getUserById(
    userId: string,
  ): Promise<{ email: string; login: string; userId: string } | null> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) return null;

    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }
}
