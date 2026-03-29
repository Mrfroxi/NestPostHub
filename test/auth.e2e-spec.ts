import { INestApplication } from '@nestjs/common';
import { UsersTestManager } from './helpers/users-test-manager';
import { initSettings } from './helpers/init-settings';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN
} from '../src/modules/user-accounts/constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../src/modules/user-accounts/domain/user.entity';


describe('auth', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;
  let userModel: Model<any>;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useValue(
          new JwtService({
            secret: process.env.JWT_SECRET_AUTH,
            signOptions: { expiresIn: '1m' },
          }),
        ),
    );
    app = result.app;
    userTestManger = result.userTestManger;
    userModel = app.get<Model<any>>(getModelToken(User.name));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  describe('POST /auth/registration', () => {
    const validRegistrationData = {
      login: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register user and return 204', async () => {
      await userTestManger.registerUser(validRegistrationData);

      const savedUser = await userModel.findOne({ email: validRegistrationData.email });
      expect(savedUser).toBeDefined();
      expect(savedUser.login).toBe(validRegistrationData.login);
      expect(savedUser.email).toBe(validRegistrationData.email);
      expect(savedUser.confirmationCode).toBeDefined();
      expect(savedUser.confirmationCode).not.toBe('');
      expect(savedUser.isEmailConfirmed).toBe(false);
    });

    it('should return 400 if login already exists', async () => {
      await userModel.create({
        login: validRegistrationData.login,
        email: 'another@example.com',
        passwordHash: 'hash',
        deletedAt: null,
      });

      const response = await userTestManger.registerUser(validRegistrationData, 400);

      expect(response.body.errorsMessages).toBeDefined();
      expect(
        response.body.errorsMessages.some((m: any) => m.field === 'login')
      ).toBe(true);
    });

    it('should return 400 if email already exists', async () => {
      await userModel.create({
        login: 'anotheruser',
        email: validRegistrationData.email,
        passwordHash: 'hash',
        deletedAt: null,
      });

      const response = await userTestManger.registerUser(validRegistrationData, 400);

      expect(response.body.errorsMessages).toBeDefined();
      expect(
        response.body.errorsMessages.some((m: any) => m.field === 'email')
      ).toBe(true);
    });

    it('should return 400 if login is invalid', async () => {
      await userTestManger.registerUser(
        { ...validRegistrationData, login: '' },
        400
      );
    });

    it('should return 400 if email is invalid', async () => {
      await userTestManger.registerUser(
        { ...validRegistrationData, email: 'invalid-email' },
        400
      );
    });

    it('should return 400 if password is invalid', async () => {
      await userTestManger.registerUser(
        { ...validRegistrationData, password: '123' },
        400
      );
    });
  });

  describe('POST /auth/registration-confirmation', () => {
    const validRegistrationData = {
      login: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should confirm registration with valid code', async () => {
      await userTestManger.registerUser(validRegistrationData);

      const savedUser = await userModel.findOne({ email: validRegistrationData.email });
      const code = savedUser.confirmationCode;

      await userTestManger.confirmRegistration({ code });

      const confirmedUser = await userModel.findOne({ email: validRegistrationData.email });
      expect(confirmedUser.isEmailConfirmed).toBe(true);
    });

    it('should return 400 if code is invalid', async () => {
      await userTestManger.confirmRegistration({ code: 'invalid-code' }, 400);
    });

    it('should return 400 if code already confirmed', async () => {
      await userTestManger.registerUser(validRegistrationData);

      const savedUser = await userModel.findOne({ email: validRegistrationData.email });
      const code = savedUser.confirmationCode;

      await userTestManger.confirmRegistration({ code });
      await userTestManger.confirmRegistration({ code }, 400);
    });
  });

  describe('POST /auth/registration-email-resending', () => {
    const validRegistrationData = {
      login: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should resend email with new confirmation code', async () => {
      await userTestManger.registerUser(validRegistrationData);

      const userBefore = await userModel.findOne({ email: validRegistrationData.email });
      const codeBefore = userBefore.confirmationCode;

      await userTestManger.resendEmailCode({ email: validRegistrationData.email });

      const userAfter = await userModel.findOne({ email: validRegistrationData.email });
      expect(userAfter.confirmationCode).not.toBe(codeBefore);
    });

    it('should return 400 if email not found', async () => {
      await userTestManger.resendEmailCode({ email: 'notfound@example.com' }, 400);
    });

    it('should return 400 if email already confirmed', async () => {
      await userTestManger.registerUser(validRegistrationData);

      const savedUser = await userModel.findOne({ email: validRegistrationData.email });
      savedUser.isEmailConfirmed = true;
      await savedUser.save();

      await userTestManger.resendEmailCode({ email: validRegistrationData.email }, 400);
    });
  });

  describe('POST /auth/login', () => {
    const validRegistrationData = {
      login: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login with login and password', async () => {
      const user = await userTestManger.registerUser(validRegistrationData);

      const response = await userTestManger.login({
        loginOrEmail: validRegistrationData.login,
        password: validRegistrationData.password,
      });

      expect(response.body.accessToken).toBeDefined();
      expect(typeof response.body.accessToken).toBe('string');
    });


    it('should return 400 if login not found', async () => {
      await userTestManger.login(
        { loginOrEmail: 'notfound', password: 'password123' },
        401
      );
    });

    it('should return 400 if password is wrong', async () => {
      await userTestManger.registerUser(validRegistrationData);

      await userTestManger.login(
        { loginOrEmail: validRegistrationData.login, password: 'wrongpassword' },
        401
      );
    });

    it('should return 400 if login is empty', async () => {
      await userTestManger.login({ loginOrEmail: '', password: 'password123' }, 400);
    });

    it('should return 400 if password is empty', async () => {
      await userTestManger.login({ loginOrEmail: 'test', password: '' }, 400);
    });
  });

  describe('POST /auth/password-recovery', () => {
    const validRegistrationData = {
      login: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should send password recovery email', async () => {
      await userTestManger.registerUser(validRegistrationData);

      await userTestManger.passwordRecovery({ email: validRegistrationData.email });

      const user = await userModel.findOne({ email: validRegistrationData.email });
      expect(user.recoveryCode).toBeDefined();
      expect(user.recoveryCode).not.toBe('');
    });

    it('should return 400 even if email not found', async () => {
      await userTestManger.passwordRecovery({ email: 'notfound@example.com' },400);
    });

    it('should return 400 if email is invalid', async () => {
      await userTestManger.passwordRecovery({ email: 'invalid-email' }, 400);
    });
  });

  describe('POST /auth/new-password', () => {
    const validRegistrationData = {
      login: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should set new password with valid recovery code', async () => {
      await userTestManger.registerUser(validRegistrationData);
      await userTestManger.passwordRecovery({ email: validRegistrationData.email });

      const user = await userModel.findOne({ email: validRegistrationData.email });
      const recoveryCode = user.recoveryCode;

      await userTestManger.newPassword({
        recoveryCode,
        newPassword: 'newPassword123',
      });

      // Try login with new password
      const loginResponse = await userTestManger.login({
        loginOrEmail: validRegistrationData.email,
        password: 'newPassword123',
      });

      expect(loginResponse.body.accessToken).toBeDefined();
    });

    it('should return 400 if recovery code is invalid', async () => {
      await userTestManger.newPassword(
        { recoveryCode: 'invalid-code', newPassword: 'newPassword123' },
        400
      );
    });

    it('should return 400 if new password is too short', async () => {
      await userTestManger.registerUser(validRegistrationData);
      await userTestManger.passwordRecovery({ email: validRegistrationData.email });

      const user = await userModel.findOne({ email: validRegistrationData.email });
      const recoveryCode = user.recoveryCode;

      await userTestManger.newPassword(
        { recoveryCode, newPassword: '123' },
        400
      );
    });
  });

  describe('GET /auth/me', () => {
    const validRegistrationData = {
      login: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return current user info', async () => {
      await userTestManger.registerUser(validRegistrationData);

      const loginResponse = await userTestManger.login({
        loginOrEmail: validRegistrationData.email,
        password: validRegistrationData.password,
      });

      const accessToken = loginResponse.body.accessToken;

      console.log(accessToken);
      console.log(process.env);
      const response = await userTestManger.getMe(accessToken);

      expect(response.body).toEqual({
        email: validRegistrationData.email,
        login: validRegistrationData.login,
        userId: expect.any(String),
      });
    });

    it('should return 401 without token', async () => {
      await userTestManger.getMe('', 401);
    });

    it('should return 401 with invalid token', async () => {
      await userTestManger.getMe('invalid-token', 401);
    });
  });
});