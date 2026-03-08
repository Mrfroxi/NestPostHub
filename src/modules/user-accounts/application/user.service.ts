import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';
import type { CreateUserInputDto } from '../api/input-dto/create-user.input-dto';
import { UsersRepository } from '../infastructure/users.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private userRepository: UsersRepository,
  ) {}

  async createAdminUser(dto: CreateUserInputDto): Promise<string> {
    const user: UserDocument = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: dto.password,
    });

    user.makeEmailConfirmed();

    await this.userRepository.save(user);

    return user.id;
  }

  async deleteUser(id: string) {
    const user: UserDocument = await this.userRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.userRepository.save(user);
  }
}
