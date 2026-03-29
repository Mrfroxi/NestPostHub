import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersTestManager } from './helpers/users-test-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../src/modules/user-accounts/constants/auth-tokens.inject-constants';


describe('users', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  describe('POST /users', () => {

    it('should create user and return 201', async () => {
      const body = {
        login: 'name1',
        password: 'qwerty',
        email: 'email@email.em',
      };

      const response = await userTestManger.createUser(body);

      expect(response).toEqual({
        login: body.login,
        email: body.email,
        id: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it('should return 400 for invalid data', async () => {
      const body = {
        login: '',
        password: 'qwerty',
        email: 'email@email.em',
      };

      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/users`)
        .send(body)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 without auth', async () => {
      const body = {
        login: 'name1',
        password: 'qwerty',
        email: 'email@email.em',
      };

      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/users`)
        .send(body)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user and return 204', async () => {
      const createdUser = await userTestManger.createUser({
        login: 'userDel1',
        password: 'qwerty123',
        email: 'delete@example.com',
      });

      await userTestManger.deleteUser(createdUser.id);

      const allUsers = await userTestManger.getAllUsers();
      expect(allUsers.body.items).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: createdUser.id }),
        ]),
      );
    });

    it('should return 404 if user not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await userTestManger.deleteUser(fakeId, { username: 'admin', password: 'qwerty' }, HttpStatus.NOT_FOUND);
    });

    it('should return 401 without auth', async () => {
      const createdUser = await userTestManger.createUser({
        login: 'userDel2',
        password: 'qwerty123',
        email: 'delete2@example.com',
      });

      await request(app.getHttpServer())
        .delete(`/${GLOBAL_PREFIX}/users/${createdUser.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /users', () => {
    it('should return paginated users list', async () => {
      await userTestManger.createUser({
        login: 'user1',
        password: 'qwerty123',
        email: 'user1@example.com',
      });
      await userTestManger.createUser({
        login: 'user2',
        password: 'qwerty123',
        email: 'user2@example.com',
      });

      const response = await userTestManger.getAllUsers({
        pageNumber: 1,
        pageSize: 10,
      });

      expect(response.body).toEqual({
        pagesCount: expect.any(Number),
        page: expect.any(Number),
        pageSize: expect.any(Number),
        totalCount: expect.any(Number),
        items: expect.arrayContaining([
          expect.objectContaining({ login: 'user1' }),
          expect.objectContaining({ login: 'user2' }),
        ]),
      });
    });

    it('should return empty array when no users', async () => {
      const response = await userTestManger.getAllUsers();

      expect(response.body.items).toEqual([]);
      expect(response.body.totalCount).toBe(0);
    });

    it('should filter users by searchLoginTerm', async () => {
      await userTestManger.createUser({
        login: 'john_doe',
        password: 'qwerty123',
        email: 'john@example.com',
      });
      await userTestManger.createUser({
        login: 'jane_smith',
        password: 'qwerty123',
        email: 'jane@example.com',
      });

      const response = await userTestManger.getAllUsers({
        searchLoginTerm: 'john',
      });

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].login).toBe('john_doe');
    });

    it('should filter users by searchEmailTerm', async () => {
      await userTestManger.createUser({
        login: 'user1',
        password: 'qwerty123',
        email: 'test1@example.com',
      });
      await userTestManger.createUser({
        login: 'user2',
        password: 'qwerty123',
        email: 'other@email.com',
      });

      const response = await userTestManger.getAllUsers({
        searchEmailTerm: 'example',
      });

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].email).toBe('test1@example.com');
    });

    it('should sort users by login asc', async () => {
      await userTestManger.createUser({
        login: 'zebra',
        password: 'qwerty123',
        email: 'z@example.com',
      });
      await userTestManger.createUser({
        login: 'alpha',
        password: 'qwerty123',
        email: 'a@example.com',
      });

      const response = await userTestManger.getAllUsers({
        sortBy: 'login',
        sortDirection: 'asc',
      });

      expect(response.body.items[0].login).toBe('alpha');
      expect(response.body.items[1].login).toBe('zebra');
    });

    it('should sort users by login desc', async () => {
      await userTestManger.createUser({
        login: 'zebra',
        password: 'qwerty123',
        email: 'z@example.com',
      });
      await userTestManger.createUser({
        login: 'alpha',
        password: 'qwerty123',
        email: 'a@example.com',
      });

      const response = await userTestManger.getAllUsers({
        sortBy: 'login',
        sortDirection: 'desc',
      });

      expect(response.body.items[0].login).toBe('zebra');
      expect(response.body.items[1].login).toBe('alpha');
    });

    it('should paginate correctly with pageSize', async () => {
      for (let i = 1; i <= 15; i++) {
        await userTestManger.createUser({
          login: `user${i}`,
          password: 'qwerty123',
          email: `user${i}@example.com`,
        });
      }

      const page1 = await userTestManger.getAllUsers({
        pageNumber: 1,
        pageSize: 10,
      });
      const page2 = await userTestManger.getAllUsers({
        pageNumber: 2,
        pageSize: 10,
      });

      expect(page1.body.items).toHaveLength(10);
      expect(page2.body.items).toHaveLength(5);
      expect(page1.body.page).toBe(1);
      expect(page2.body.page).toBe(2);
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/users`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
