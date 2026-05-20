import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '@src/module/user-accounts/domain/user.entity';
import { DeviceSession } from '@src/module/user-accounts/domain/device-session.entity';
import { GetUsersQueryInputDto } from '@src/module/user-accounts/api/input-dto/get-users-query.input-dto';

type UserOutputDto = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

@Injectable()
export class AuthQueryRepository {
  private readonly allowedSortFields = ['createdAt', 'login', 'email'];

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(DeviceSession)
    private readonly sessionsRepository: Repository<DeviceSession>,
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

  async getSessionsByUserId(
    userId: string,
  ): Promise<
    { ip: string; title: string; lastActiveDate: string; deviceId: string }[]
  > {
    const sessions = await this.sessionsRepository.findBy({ userId });

    return sessions.map((s) => ({
      ip: s.ip,
      title: s.title ?? '',
      lastActiveDate: s.createdAt.toISOString(),
      deviceId: s.deviceId,
    }));
  }

  async getUsersPaginated(query: GetUsersQueryInputDto): Promise<{
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: UserOutputDto[];
  }> {
    const sortBy = this.allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const direction = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    const queryBuilder = this.usersRepository.createQueryBuilder('u');

    if (query.searchLoginTerm || query.searchEmailTerm) {
      if (query.searchLoginTerm && query.searchEmailTerm) {
        queryBuilder.where('u.login ILIKE :login OR u.email ILIKE :email', {
          login: `%${query.searchLoginTerm}%`,
          email: `%${query.searchEmailTerm}%`,
        });
      } else if (query.searchLoginTerm) {
        queryBuilder.where('u.login ILIKE :login', {
          login: `%${query.searchLoginTerm}%`,
        });
      } else if (query.searchEmailTerm) {
        queryBuilder.where('u.email ILIKE :email', {
          email: `%${query.searchEmailTerm}%`,
        });
      }
    }

    if (sortBy === 'login' || sortBy === 'email') {
      queryBuilder.orderBy(`u.${sortBy} COLLATE "C"`, direction);
    } else {
      queryBuilder.orderBy(`u.${sortBy}`, direction);
    }

    const [users, totalCount] = await queryBuilder
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items: users.map((u) => ({
        id: u.id,
        login: u.login,
        email: u.email,
        createdAt: u.createdAt.toISOString(),
      })),
    };
  }
}
