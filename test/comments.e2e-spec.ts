import { INestApplication } from '@nestjs/common';
import { PostsTestManager } from './helpers/posts-test-manager';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { UsersTestManager } from './helpers/users-test-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from '../src/modules/blogPlatform/domain/comment.entity';
import { Post } from '../src/modules/blogPlatform/domain/post.entity';
import { User } from '../src/modules/user-accounts/domain/user.entity';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';


describe('comments', () => {
  let app: INestApplication;
  let postsTestManager: PostsTestManager;
  let blogsTestManager: BlogsTestManager;
  let userTestManager: UsersTestManager;
  let commentModel: Model<any>;
  let postModel: Model<any>;
  let userModel: Model<any>;

  let accessToken: string;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    postsTestManager = result.postsTestManager;
    blogsTestManager = result.blogsTestManager;
    userTestManager = result.userTestManger;
    commentModel = app.get<Model<any>>(getModelToken(Comment.name));
    postModel = app.get<Model<any>>(getModelToken(Post.name));
    userModel = app.get<Model<any>>(getModelToken(User.name));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);

    // Register and login a user
    await userTestManager.registerUser({
      login: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    // Confirm the user
    const user = await userModel.findOne({ email: 'test@example.com' });
    user.confirmationCode = 'valid-code';
    user.isEmailConfirmed = true;
    await user.save();

    const loginResponse = await userTestManager.login({
      loginOrEmail: 'testuser',
      password: 'password123',
    });

    accessToken = loginResponse.body.accessToken;
  });

  describe('POST /posts/:postId/comments', () => {
    it('should create comment and return 201', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      const response = await postsTestManager.createCommentForPost(
        post.body.id,
        { content: 'This is a test comment with more than 20 characters' },
        accessToken,
      );

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        content: 'This is a test comment with more than 20 characters',
        commentatorInfo: expect.objectContaining({
          userId: expect.any(String),
          userLogin: 'testuser',
        }),
        createdAt: expect.any(String),
        likesInfo: expect.objectContaining({
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: 'None',
        }),
      });

      const savedComment = await commentModel.findById(response.body.id);
      expect(savedComment).toBeDefined();
    });

    it('should return 401 if not authorized', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/posts/${post.body.id}/comments`)
        .send({ content: 'This is a test comment with more than 20 characters' })
        .expect(401);
    });

    it('should return 404 if post not found', async () => {
      const fakePostId = '507f1f77bcf86cd799439011';

      await postsTestManager.createCommentForPost(
        fakePostId,
        { content: 'This is a test comment with more than 20 characters' },
        accessToken,
        404,
      );
    });

    it('should return 400 if content is too short', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      await postsTestManager.createCommentForPost(
        post.body.id,
        { content: 'Too short' },
        accessToken,
        400,
      );
    });

    it('should return 400 if content is too long', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      await postsTestManager.createCommentForPost(
        post.body.id,
        { content: 'a'.repeat(301) },
        accessToken,
        400,
      );
    });

    it('should return 400 if content is empty', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      await postsTestManager.createCommentForPost(
        post.body.id,
        { content: '' },
        accessToken,
        400,
      );
    });
  });

  describe('GET /posts/:postId/comments', () => {
    it('should return empty array when no comments', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      const response = await postsTestManager.getCommentsForPost(post.body.id);

      expect(response.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should return comments with pagination', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      await postsTestManager.createCommentForPost(
        post.body.id,
        { content: 'First comment with more than 20 characters' },
        accessToken,
      );

      await postsTestManager.createCommentForPost(
        post.body.id,
        { content: 'Second comment with more than 20 characters' },
        accessToken,
      );

      const response = await postsTestManager.getCommentsForPost(post.body.id, {
        pageNumber: 1,
        pageSize: 10,
      });

      expect(response.body.totalCount).toBe(2);
      expect(response.body.items).toHaveLength(2);
    });

    it('should return 404 if post not found', async () => {
      const fakePostId = '507f1f77bcf86cd799439011';

      await postsTestManager.getCommentsForPost(fakePostId, {}, 404);
    });
  });

  describe('GET /comments/:id', () => {
    it('should return comment by id', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      const comment = await postsTestManager.createCommentForPost(
        post.body.id,
        { content: 'This is a test comment with more than 20 characters' },
        accessToken,
      );

      const response = await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/comments/${comment.body.id}`)
        .expect(200);

      expect(response.body).toEqual({
        id: comment.body.id,
        content: 'This is a test comment with more than 20 characters',
        commentatorInfo: expect.objectContaining({
          userId: expect.any(String),
          userLogin: 'testuser',
        }),
        createdAt: expect.any(String),
        likesInfo: expect.objectContaining({
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: 'None',
        }),
      });
    });

    it('should return 404 if comment not found', async () => {
      const fakeCommentId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/comments/${fakeCommentId}`)
        .expect(404);
    });
  });

  describe('PUT /comments/:commentId', () => {
    it('should update comment and return 204', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      const comment = await postsTestManager.createCommentForPost(
        post.body.id,
        { content: 'This is a test comment with more than 20 characters' },
        accessToken,
      );

      await request(app.getHttpServer())
        .put(`/${GLOBAL_PREFIX}/comments/${comment.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Updated comment with more than 20 characters here' })
        .expect(204);

      const updatedComment = await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/comments/${comment.body.id}`)
        .expect(200);

      expect(updatedComment.body.content).toBe(
        'Updated comment with more than 20 characters here',
      );
    });

    it('should return 404 if comment not found', async () => {
      const fakeCommentId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .put(`/${GLOBAL_PREFIX}/comments/${fakeCommentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Updated comment with more than 20 characters here' })
        .expect(404);
    });

    it('should return 400 if content is too short', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      const comment = await postsTestManager.createCommentForPost(
        post.body.id,
        { content: 'This is a test comment with more than 20 characters' },
        accessToken,
      );

      await request(app.getHttpServer())
        .put(`/${GLOBAL_PREFIX}/comments/${comment.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Too short' })
        .expect(400);
    });

    it('should return 401 if not authorized', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      const comment = await postsTestManager.createCommentForPost(
        post.body.id,
        { content: 'This is a test comment with more than 20 characters' },
        accessToken,
      );

      await request(app.getHttpServer())
        .put(`/${GLOBAL_PREFIX}/comments/${comment.body.id}`)
        .send({ content: 'Updated comment with more than 20 characters here' })
        .expect(401);
    });

    it('should return 403 if user is not the comment owner', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      // Register second user
      await userTestManager.registerUser({
        login: 'seconduser',
        email: 'second@example.com',
        password: 'password123',
      });

      const secondUser = await userModel.findOne({ email: 'second@example.com' });
      secondUser.confirmationCode = 'valid-code-2';
      secondUser.isEmailConfirmed = true;
      await secondUser.save();

      const secondLoginResponse = await userTestManager.login({
        loginOrEmail: 'seconduser',
        password: 'password123',
      });

      const secondAccessToken = secondLoginResponse.body.accessToken;

      // First user creates comment
      const comment = await postsTestManager.createCommentForPost(
        post.body.id,
        { content: 'This is a test comment with more than 20 characters' },
        accessToken,
      );

      // Second user tries to update
      await request(app.getHttpServer())
        .put(`/${GLOBAL_PREFIX}/comments/${comment.body.id}`)
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .send({ content: 'Updated comment with more than 20 characters here' })
        .expect(403);
    });
  });

  describe('DELETE /comments/:commentId', () => {
    it('should delete comment and return 204', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      const comment = await postsTestManager.createCommentForPost(
        post.body.id,
        { content: 'This is a test comment with more than 20 characters' },
        accessToken,
      );

      await request(app.getHttpServer())
        .delete(`/${GLOBAL_PREFIX}/comments/${comment.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/comments/${comment.body.id}`)
        .expect(404);
    });

    it('should return 404 if comment not found', async () => {
      const fakeCommentId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .delete(`/${GLOBAL_PREFIX}/comments/${fakeCommentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 401 if not authorized', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      const comment = await postsTestManager.createCommentForPost(
        post.body.id,
        { content: 'This is a test comment with more than 20 characters' },
        accessToken,
      );

      await request(app.getHttpServer())
        .delete(`/${GLOBAL_PREFIX}/comments/${comment.body.id}`)
        .expect(401);
    });

    it('should return 403 if user is not the comment owner', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const post = await postsTestManager.createPost({
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
        blogId: blog.body.id,
      });

      // Register second user
      await userTestManager.registerUser({
        login: 'seconduser',
        email: 'second@example.com',
        password: 'password123',
      });

      const secondUser = await userModel.findOne({ email: 'second@example.com' });
      secondUser.confirmationCode = 'valid-code-2';
      secondUser.isEmailConfirmed = true;
      await secondUser.save();

      const secondLoginResponse = await userTestManager.login({
        loginOrEmail: 'seconduser',
        password: 'password123',
      });

      const secondAccessToken = secondLoginResponse.body.accessToken;

      // First user creates comment
      const comment = await postsTestManager.createCommentForPost(
        post.body.id,
        { content: 'This is a test comment with more than 20 characters' },
        accessToken,
      );

      // Second user tries to delete
      await request(app.getHttpServer())
        .delete(`/${GLOBAL_PREFIX}/comments/${comment.body.id}`)
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .expect(403);
    });
  });
});
