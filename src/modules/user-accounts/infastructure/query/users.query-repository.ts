import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
  type UserModelType,
} from '../../domain/user.entity';
import { FilterQuery } from 'mongoose';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UserOutputDtoDto } from '../../api/output/users.output-dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserOutputDtoDto> {
    const user: UserDocument | null = await this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserOutputDtoDto.mapToView(user);
  }

  async getAll(query: GetUsersQueryParams) {
    const filter: FilterQuery<User> = {
      deletedAt: null,
    };

    if (query.searchLoginTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    const users: UserDocument[] = await this.UserModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount: number = await this.UserModel.countDocuments(filter);

    const items: UserOutputDtoDto[] = users.map((user: UserDocument) =>
      UserOutputDtoDto.mapToView(user),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
