import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
  type UserModelType,
} from '../../domain/user.entity';
import { Argon2Service } from '../../../../core/external-service/argon2.service';
import { CreateUserDto } from '../../dto/user.dto';

export class UsersFactory {
  constructor(
    private readonly argonService: Argon2Service,
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const passwordHash = await this.createPasswordHash(dto);
    const user = this.createUserInstance(dto, passwordHash);

    return user;
  }

  private async createPasswordHash(dto: CreateUserDto) {
    return this.argonService.hashPassword(dto.password);
  }

  private createUserInstance(dto: CreateUserDto, passwordHash: string) {
    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
    });
    return user;
  }
}
