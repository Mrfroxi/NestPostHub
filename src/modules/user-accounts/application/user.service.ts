import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';
import type { CreateUserInputDto } from '../api/input-dto/create-user.input-dto';
import { UsersRepository } from '../infastructure/users.repository';
import { Argon2Service } from '../../../core/external-service/argon2.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private userRepository: UsersRepository,
    private argon2Service: Argon2Service,
  ) {}

  async createAdminUser(dto: CreateUserInputDto): Promise<string> {
    const passwordHash = await this.argon2Service.hashPassword(dto.password);

    const user: UserDocument = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash,
    });

    user.makeEmailConfirmed();

    await this.userRepository.save(user);

    return user.getId;
  }

  async createUser(dto: CreateUserInputDto): Promise<void> {
    const passwordHash = await this.argon2Service.hashPassword(dto.password);

    const confirmationCode: string = crypto.randomUUID();

    const user: UserDocument = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash,
    });

    user.setConfirmationCode(confirmationCode);
    await this.userRepository.save(user);
  }

  async deleteUser(id: string) {
    const user: UserDocument = await this.userRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.userRepository.save(user);
  }
}
