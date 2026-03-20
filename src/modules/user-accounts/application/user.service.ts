import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { UserModelType } from '../domain/user.entity';
import { User, UserDocument } from '../domain/user.entity';
import type { CreateUserInputDto } from '../api/input-dto/create-user.input-dto';
import { UsersRepository } from '../infastructure/users.repository';
import { Argon2Service } from '../../../core/external-service/argon2.service';
import { MailerService } from '@nestjs-modules/mailer';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private userRepository: UsersRepository,
    private argon2Service: Argon2Service,
    private readonly mailService: MailerService,
  ) {}

  async createUser(dto: CreateUserInputDto): Promise<UserDocument> {
    const userWithTheSameLogin: UserDocument | null =
      await this.userRepository.findByLogin(dto.login);

    if (userWithTheSameLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same login already exists',
      });
    }

    const userWithTheSameEmail: UserDocument | null =
      await this.userRepository.findByEmail(dto.email);

    if (userWithTheSameEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same login already exists',
      });
    }

    const passwordHash = await this.argon2Service.hashPassword(dto.password);

    return this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash,
    });
  }

  async registerAdminUser(dto: CreateUserInputDto): Promise<string> {
    const createdUser: UserDocument = await this.createUser(dto);

    createdUser.makeEmailConfirmed();

    await this.userRepository.save(createdUser);

    return createdUser.getId;
  }

  async registerUser(dto: CreateUserInputDto): Promise<void> {
    const createdUser: UserDocument = await this.createUser(dto);

    const confirmationCode: string = crypto.randomUUID();

    createdUser.setConfirmationCode(confirmationCode);
    await this.userRepository.save(createdUser);

    void this.mailService.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: dto.email,
      subject: `How to Send Emails with Nodemailer`,
      text: 'hey',
    });
  }

  async deleteUser(id: string) {
    const user: UserDocument = await this.userRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.userRepository.save(user);
  }
}
