import { INestApplication } from '@nestjs/common';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from '../src/modules/blogPlatform/domain/blog.entity';


describe('blogs', () => {
  let app: INestApplication;
  let blogsTestManager: BlogsTestManager;
  let blogModel: Model<any>;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    blogsTestManager = result.blogsTestManager;
    blogModel = app.get<Model<any>>(getModelToken(Blog.name));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  describe('POST /blogs', () => {
    const validBlogData = {
      name: 'Test Blog',
      description: 'Test Description',
      websiteUrl: 'https://test.com',
    };

    it('should create blog and return 201', async () => {
      const response = await blogsTestManager.createBlog(validBlogData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        name: validBlogData.name,
        description: validBlogData.description,
        websiteUrl: validBlogData.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      });
    });
  });

  describe('GET /blogs/:blogId/posts', () => {
    it('should return empty posts array for blog without posts', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const response = await blogsTestManager.getPostsForBlog(blog.body.id);

      expect(response.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should return posts with pagination', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await blogsTestManager.createPostForBlog(blog.body.id, {
        title: 'Post 1',
        shortDescription: 'Desc 1',
        content: 'Content 1',
      });

      await blogsTestManager.createPostForBlog(blog.body.id, {
        title: 'Post 2',
        shortDescription: 'Desc 2',
        content: 'Content 2',
      });

      const response = await blogsTestManager.getPostsForBlog(blog.body.id, {
        pageNumber: 1,
        pageSize: 10,
      });

      expect(response.body.totalCount).toBe(2);
      expect(response.body.items).toHaveLength(2);
    });
  });

  describe('POST /blogs/:blogId/posts', () => {
    const validPostData = {
      title: 'Test Post',
      shortDescription: 'Short Description',
      content: 'Full Content',
    };

    it('should create post and return 201', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const response = await blogsTestManager.createPostForBlog(
        blog.body.id,
        validPostData
      );

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        title: validPostData.title,
        shortDescription: validPostData.shortDescription,
        content: validPostData.content,
        blogId: blog.body.id,
        blogName: blog.body.name,
        createdAt: expect.any(String),
        extendedLikesInfo: expect.objectContaining({
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: expect.any(Array),
        }),
      });
    });
  });
});
