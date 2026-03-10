import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async save(user: UserDocument): Promise<void> {
    await user.save();
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user: UserDocument | null = await this.UserModel.findById(id);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
