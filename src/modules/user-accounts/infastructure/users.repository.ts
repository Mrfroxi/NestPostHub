import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(user: UserDocument): Promise<void> {
    await user.save();
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user: UserDocument | null = await this.findById(id);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  findByLogin(login: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ login });
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ email });
  }

  findByCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ confirmationCode: code });
  }
}
