import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreateUserInputDto } from '../../src/modules/user-accounts/api/input-dto/create-user.input-dto';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import supertest from 'supertest';

export interface GetUsersQueryParams {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
}

export interface RegistrationDto {
  login: string;
  email: string;
  password: string;
}

export interface LoginDto {
  loginOrEmail: string;
  password: string;
}

export interface ConfirmationCodeDto {
  code: string;
}

export interface ResendEmailDto {
  email: string;
}

export interface PasswordRecoveryDto {
  email: string;
}

export interface NewPasswordDto {
  recoveryCode: string;
  newPassword: string;
}

export class UsersTestManager {
  constructor(private app: INestApplication) {}

  async createUser(
    createModel: CreateUserInputDto,
    statusCode: number = HttpStatus.CREATED,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/users`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body;
  }

  async deleteUser(
    id: string,
    authToken: { username: string; password: string } = { username: 'admin', password: 'qwerty' },
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/users/${id}`)
      .auth(authToken.username, authToken.password)
      .expect(statusCode);
  }

  async getAllUsers(
    params: GetUsersQueryParams = {},
    statusCode: number = HttpStatus.OK,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/users`)
      .query(params)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }

  async registerUser(
    dto: RegistrationDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send(dto)
      .expect(statusCode);
  }

  async confirmRegistration(
    dto: ConfirmationCodeDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration-confirmation`)
      .send(dto)
      .expect(statusCode);
  }

  async resendEmailCode(
    dto: ResendEmailDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration-email-resending`)
      .send(dto)
      .expect(statusCode);
  }

  async login(
    dto: LoginDto,
    statusCode: number = HttpStatus.OK,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send(dto)
      .expect(statusCode);
  }

  async getMe(
    accessToken: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/auth/me`)
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);
  }

  async passwordRecovery(
    dto: PasswordRecoveryDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/password-recovery`)
      .send(dto)
      .expect(statusCode);
  }

  async newPassword(
    dto: NewPasswordDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/new-password`)
      .send(dto)
      .expect(statusCode);
  }
}
