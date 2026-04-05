import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
  type UserModelType,
} from '../../domain/user.entity';
import { Argon2Service } from '../../../../core/external-service/argon2.service';

import { CreateUserInputDto } from '../../api/input-dto/create-user.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infastructure/users.repository';

export class UsersFactory {
  constructor(
    private readonly argonService: Argon2Service,
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private userRepository: UsersRepository,
  ) {}

  async create(dto: CreateUserInputDto): Promise<UserDocument> {
    await this.validateUserInput(dto);

    const passwordHash = await this.createPasswordHash(dto);
    const user: UserDocument = this.createUserInstance(dto, passwordHash);

    return user;
  }

  private async createPasswordHash(dto: CreateUserInputDto) {
    return this.argonService.hashPassword(dto.password);
  }

  private async validateUserInput(dto: CreateUserInputDto) {
    const userWithTheSameLogin: UserDocument | null =
      await this.userRepository.findByLogin(dto.login);

    if (userWithTheSameLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            message: 'User with the same login already exists',
            field: 'login',
          },
        ],
      });
    }

    const userWithTheSameEmail: UserDocument | null =
      await this.userRepository.findByEmail(dto.email);

    if (userWithTheSameEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            message: 'User with the same email already exists',
            field: 'email',
          },
        ],
      });
    }
  }

  private createUserInstance(dto: CreateUserInputDto, passwordHash: string) {
    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
    });
    return user;
  }
}
