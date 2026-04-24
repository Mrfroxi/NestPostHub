import { INestApplication } from '@nestjs/common';
import { PostsTestManager } from './helpers/posts-test-manager';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { UsersTestManager } from './helpers/users-test-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../src/modules/blogPlatform/domain/post.entity';
import { Comment } from '../src/modules/blogPlatform/domain/comment.entity';
import { User } from '../src/modules/user-accounts/domain/user.entity';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';


describe('likes & dislikes', () => {
  let app: INestApplication;
  let postsTestManager: PostsTestManager;
  let blogsTestManager: BlogsTestManager;
  let userTestManager: UsersTestManager;
  let postModel: Model<any>;
  let commentModel: Model<any>;
  let userModel: Model<any>;

  let accessToken: string;
  let secondAccessToken: string;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    postsTestManager = result.postsTestManager;
    blogsTestManager = result.blogsTestManager;
    userTestManager = result.userTestManger;
    postModel = app.get<Model<any>>(getModelToken(Post.name));
    commentModel = app.get<Model<any>>(getModelToken(Comment.name));
    userModel = app.get<Model<any>>(getModelToken(User.name));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);

    // Register and login first user
    await userTestManager.registerUser({
      login: 'user1',
      email: 'user1@example.com',
      password: 'password123',
    });

    const user1 = await userModel.findOne({ email: 'user1@example.com' });
    user1.confirmationCode = 'valid-code-1';
    user1.isEmailConfirmed = true;
    await user1.save();

    const loginResponse1 = await userTestManager.login({
      loginOrEmail: 'user1',
      password: 'password123',
    });

    accessToken = loginResponse1.body.accessToken;

    // Register and login second user
    await userTestManager.registerUser({
      login: 'user2',
      email: 'user2@example.com',
      password: 'password123',
    });

    const user2 = await userModel.findOne({ email: 'user2@example.com' });
    user2.confirmationCode = 'valid-code-2';
    user2.isEmailConfirmed = true;
    await user2.save();

    const loginResponse2 = await userTestManager.login({
      loginOrEmail: 'user2',
      password: 'password123',
    });

    secondAccessToken = loginResponse2.body.accessToken;
  });

  describe('POST /posts/:postId/like-status', () => {
    it('should like a post and increment likesCount', async () => {
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

      await postsTestManager.likeDislikePost(
        post.body.id,
        { likeStatus: 'Like' },
        accessToken,
      );

      const response = await postsTestManager.getPostById(post.body.id, accessToken);

      expect(response.body.extendedLikesInfo.likesCount).toBe(1);
      expect(response.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(response.body.extendedLikesInfo.myStatus).toBe('Like');
    });

    it('should dislike a post and increment dislikesCount', async () => {
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

      await postsTestManager.likeDislikePost(
        post.body.id,
        { likeStatus: 'Dislike' },
        accessToken,
      );

      const response = await postsTestManager.getPostById(post.body.id, accessToken);

      expect(response.body.extendedLikesInfo.likesCount).toBe(0);
      expect(response.body.extendedLikesInfo.dislikesCount).toBe(1);
      expect(response.body.extendedLikesInfo.myStatus).toBe('Dislike');
    });

    it('should remove like when setting status to None', async () => {
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

      // Like first
      await postsTestManager.likeDislikePost(
        post.body.id,
        { likeStatus: 'Like' },
        accessToken,
      );

      // Remove like
      await postsTestManager.likeDislikePost(
        post.body.id,
        { likeStatus: 'None' },
        accessToken,
      );

      const response = await postsTestManager.getPostById(post.body.id, accessToken);

      expect(response.body.extendedLikesInfo.likesCount).toBe(0);
      expect(response.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(response.body.extendedLikesInfo.myStatus).toBe('None');
    });

    it('should allow different users to like the same post', async () => {
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

      await postsTestManager.likeDislikePost(
        post.body.id,
        { likeStatus: 'Like' },
        accessToken,
      );

      await postsTestManager.likeDislikePost(
        post.body.id,
        { likeStatus: 'Like' },
        secondAccessToken,
      );

      const response = await postsTestManager.getPostById(post.body.id, accessToken);

      expect(response.body.extendedLikesInfo.likesCount).toBe(2);
    });

    it('should change from like to dislike', async () => {
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

      // Like first
      await postsTestManager.likeDislikePost(
        post.body.id,
        { likeStatus: 'Like' },
        accessToken,
      );

      // Change to dislike
      await postsTestManager.likeDislikePost(
        post.body.id,
        { likeStatus: 'Dislike' },
        accessToken,
      );

      const response = await postsTestManager.getPostById(post.body.id, accessToken);

      expect(response.body.extendedLikesInfo.likesCount).toBe(0);
      expect(response.body.extendedLikesInfo.dislikesCount).toBe(1);
      expect(response.body.extendedLikesInfo.myStatus).toBe('Dislike');
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
        .put(`/${GLOBAL_PREFIX}/posts/${post.body.id}/like-status`)
        .send({ likeStatus: 'Like' })
        .expect(401);
    });

    it('should return 400 if likeStatus is invalid', async () => {
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
        .put(`/${GLOBAL_PREFIX}/posts/${post.body.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'InvalidStatus' })
        .expect(400);
    });

    it('should return 404 if post not found', async () => {
      const fakePostId = '507f1f77bcf86cd799439011';

      await postsTestManager.likeDislikePost(
        fakePostId,
        { likeStatus: 'Like' },
        accessToken,
        404,
      );
    });
  });

  describe('PUT /comments/:commentId/like-status', () => {
    it('should like a comment and increment likesCount', async () => {
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
        .put(`/${GLOBAL_PREFIX}/comments/${comment.body.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'Like' })
        .expect(204);

      const response = await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/comments/${comment.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.likesInfo.likesCount).toBe(1);
      expect(response.body.likesInfo.dislikesCount).toBe(0);
      expect(response.body.likesInfo.myStatus).toBe('Like');
    });

    it('should dislike a comment and increment dislikesCount', async () => {
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
        .put(`/${GLOBAL_PREFIX}/comments/${comment.body.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'Dislike' })
        .expect(204);

      const response = await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/comments/${comment.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.likesInfo.likesCount).toBe(0);
      expect(response.body.likesInfo.dislikesCount).toBe(1);
      expect(response.body.likesInfo.myStatus).toBe('Dislike');
    });

    it('should remove like when setting status to None', async () => {
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

      // Like first
      await request(app.getHttpServer())
        .put(`/${GLOBAL_PREFIX}/comments/${comment.body.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'Like' })
        .expect(204);

      // Remove like
      await request(app.getHttpServer())
        .put(`/${GLOBAL_PREFIX}/comments/${comment.body.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'None' })
        .expect(204);

      const response = await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/comments/${comment.body.id}`)
        .expect(200);

      expect(response.body.likesInfo.likesCount).toBe(0);
      expect(response.body.likesInfo.dislikesCount).toBe(0);
      expect(response.body.likesInfo.myStatus).toBe('None');
    });

    it('should allow different users to like the same comment', async () => {
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
        .put(`/${GLOBAL_PREFIX}/comments/${comment.body.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'Like' })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/${GLOBAL_PREFIX}/comments/${comment.body.id}/like-status`)
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .send({ likeStatus: 'Like' })
        .expect(204);

      const response = await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/comments/${comment.body.id}`)
        .expect(200);

      expect(response.body.likesInfo.likesCount).toBe(2);
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
        .put(`/${GLOBAL_PREFIX}/comments/${comment.body.id}/like-status`)
        .send({ likeStatus: 'Like' })
        .expect(401);
    });

    it('should return 400 if likeStatus is invalid', async () => {
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
        .put(`/${GLOBAL_PREFIX}/comments/${comment.body.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'InvalidStatus' })
        .expect(400);
    });

    it('should return 404 if comment not found', async () => {
      const fakeCommentId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .put(`/${GLOBAL_PREFIX}/comments/${fakeCommentId}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'Like' })
        .expect(404);
    });
  });
});
