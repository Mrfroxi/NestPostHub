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
            secret: 'access-token-secret',
            signOptions: { expiresIn: '2s' },
          }),
        )
        .overrideProvider(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
        .useValue(
          new JwtService({
            secret: 'refresh-token-secret',
            signOptions: { expiresIn: '10m' },
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
});