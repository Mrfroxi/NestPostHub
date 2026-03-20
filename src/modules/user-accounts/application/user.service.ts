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
import { emailExamples } from '../../../core/helpers/email-template';
import {
  ConfirmationCodeInputDto,
  ResendEmailInputDto,
} from '../api/input-dto/resendEmail.input.dto';

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
      text: emailExamples.registrationEmail(confirmationCode),
    });
  }

  async deleteUser(id: string) {
    const user: UserDocument = await this.userRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.userRepository.save(user);
  }

  async resendEmailCode(dto: ResendEmailInputDto): Promise<void> {
    const userByEmail: UserDocument | null =
      await this.userRepository.findByEmail(dto.email);

    if (!userByEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [{ message: 'Email not found', field: 'email' }],
      });
    }

    const isConfirmed: any = userByEmail.getIsEmailConfirmed;

    if (isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            message: 'User with the same email already confirmed',
            field: 'email',
          },
        ],
      });
    }

    const confirmationCode: string = userByEmail.getConfirmationCode;

    void this.mailService.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: dto.email,
      subject: `How to Send Emails with Nodemailer`,
      text: emailExamples.registrationEmail(confirmationCode),
    });
  }

  async confirmationUser(dto: ConfirmationCodeInputDto): Promise<void> {
    const userByCode: UserDocument | null =
      await this.userRepository.findByCode(dto.code);

    if (!userByCode) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            message: 'User with the same code not found',
            field: 'findUserByCode',
          },
        ],
      });
    }
    const isConfirmed = userByCode.getIsEmailConfirmed;

    if (isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            message: 'User with the same code confirmed',
            field: 'isConfirmed',
          },
        ],
      });
    }

    userByCode.makeEmailConfirmed();
    await this.userRepository.save(userByCode);
  }
}
