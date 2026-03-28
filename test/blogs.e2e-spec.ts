import { INestApplication } from '@nestjs/common';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from '../src/modules/blogPlatform/domain/blog.entity';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';


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

    it('should return 401 if not authorized', async () => {
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/blogs`)
        .send(validBlogData)
        .expect(401);
    });

    it('should return 400 if name is too long', async () => {
      await blogsTestManager.createBlog(
        { ...validBlogData, name: 'a'.repeat(16) },
        400
      );
    });

    it('should return 400 if description is too long', async () => {
      await blogsTestManager.createBlog(
        { ...validBlogData, description: 'a'.repeat(501) },
        400
      );
    });

    it('should return 400 if websiteUrl is invalid', async () => {
      await blogsTestManager.createBlog(
        { ...validBlogData, websiteUrl: 'invalid-url' },
        400
      );
    });

    it('should return 400 if websiteUrl is http not https', async () => {
      await blogsTestManager.createBlog(
        { ...validBlogData, websiteUrl: 'http://test.com' },
        400
      );
    });
  });

  describe('GET /blogs/:id', () => {
    it('should return blog by id', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const response = await blogsTestManager.getBlogById(blog.body.id);

      expect(response.body).toEqual({
        id: blog.body.id,
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('should return 404 if blog not found', async () => {
      const fakeBlogId = '507f1f77bcf86cd799439011';

      await blogsTestManager.getBlogById(fakeBlogId, 404);
    });
  });

  describe('PUT /blogs/:id', () => {
    it('should update blog and return 204', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await blogsTestManager.updateBlog(blog.body.id, {
        name: 'Updated Blog',
        description: 'Updated Description',
        websiteUrl: 'https://updated.com',
      });

      const updatedBlog = await blogsTestManager.getBlogById(blog.body.id);

      expect(updatedBlog.body).toEqual({
        id: blog.body.id,
        name: 'Updated Blog',
        description: 'Updated Description',
        websiteUrl: 'https://updated.com',
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('should return 404 if blog not found', async () => {
      const fakeBlogId = '507f1f77bcf86cd799439011';

      await blogsTestManager.updateBlog(
        fakeBlogId,
        {
          name: 'Valid Name',
          description: 'Valid Description',
          websiteUrl: 'https://valid.com',
        },
        404
      );
    });

    it('should return 400 if name is too long', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await blogsTestManager.updateBlog(
        blog.body.id,
        { name: 'a'.repeat(16) },
        400
      );
    });

    it('should return 400 if websiteUrl is invalid', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await blogsTestManager.updateBlog(
        blog.body.id,
        { websiteUrl: 'invalid-url' },
        400
      );
    });

    it('should return 401 if not authorized', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await request(app.getHttpServer())
        .put(`/${GLOBAL_PREFIX}/blogs/${blog.body.id}`)
        .send({ name: 'Updated' })
        .expect(401);
    });
  });

  describe('DELETE /blogs/:id', () => {
    it('should delete blog and return 204', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await blogsTestManager.deleteBlog(blog.body.id);

      await blogsTestManager.getBlogById(blog.body.id, 404);
    });

    it('should return 404 if blog not found', async () => {
      const fakeBlogId = '507f1f77bcf86cd799439011';

      await blogsTestManager.deleteBlog(fakeBlogId, 404);
    });

    it('should return 401 if not authorized', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await request(app.getHttpServer())
        .delete(`/${GLOBAL_PREFIX}/blogs/${blog.body.id}`)
        .expect(401);
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

    it('should return 404 if blog not found', async () => {
      const fakeBlogId = '507f1f77bcf86cd799439011';

      await blogsTestManager.createPostForBlog(fakeBlogId, validPostData, 404);
    });

    it('should return 401 if not authorized', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/blogs/${blog.body.id}/posts`)
        .send(validPostData)
        .expect(401);
    });
  });

  describe('GET /blogs/:blogId/posts', () => {
    it('should return 404 if blog not found', async () => {
      const fakeBlogId = '507f1f77bcf86cd799439011';

      await blogsTestManager.getPostsForBlog(fakeBlogId, {}, 404);
    });

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

    it('should sort posts by createdAt desc', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await blogsTestManager.createPostForBlog(blog.body.id, {
        title: 'First Post',
        shortDescription: 'Desc 1',
        content: 'Content 1',
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      await blogsTestManager.createPostForBlog(blog.body.id, {
        title: 'Second Post',
        shortDescription: 'Desc 2',
        content: 'Content 2',
      });

      const response = await blogsTestManager.getPostsForBlog(blog.body.id, {
        sortDirection: 'desc',
      });

      expect(response.body.items[0].title).toBe('Second Post');
      expect(response.body.items[1].title).toBe('First Post');
    });

    it('should sort posts by createdAt asc', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await blogsTestManager.createPostForBlog(blog.body.id, {
        title: 'First Post',
        shortDescription: 'Desc 1',
        content: 'Content 1',
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      await blogsTestManager.createPostForBlog(blog.body.id, {
        title: 'Second Post',
        shortDescription: 'Desc 2',
        content: 'Content 2',
      });

      const response = await blogsTestManager.getPostsForBlog(blog.body.id, {
        sortDirection: 'asc',
      });

      expect(response.body.items[0].title).toBe('First Post');
      expect(response.body.items[1].title).toBe('Second Post');
    });
  });

  describe('GET /blogs', () => {
    it('should return empty array when no blogs', async () => {
      const response = await blogsTestManager.getAllBlogs();

      expect(response.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should return blogs with pagination', async () => {
      await blogsTestManager.createBlog({
        name: 'Blog 1',
        description: 'Description 1',
        websiteUrl: 'https://blog1.com',
      });

      await blogsTestManager.createBlog({
        name: 'Blog 2',
        description: 'Description 2',
        websiteUrl: 'https://blog2.com',
      });

      const response = await blogsTestManager.getAllBlogs({
        pageNumber: 1,
        pageSize: 10,
      });

      expect(response.body.totalCount).toBe(2);
      expect(response.body.items).toHaveLength(2);
    });

    it('should filter blogs by searchNameTerm', async () => {
      await blogsTestManager.createBlog({
        name: 'Tech Blog',
        description: 'About technology',
        websiteUrl: 'https://tech.com',
      });

      await blogsTestManager.createBlog({
        name: 'Food Blog',
        description: 'About food',
        websiteUrl: 'https://food.com',
      });

      const response = await blogsTestManager.getAllBlogs({
        searchNameTerm: 'Tech',
      });

      expect(response.body.totalCount).toBe(1);
      expect(response.body.items[0].name).toBe('Tech Blog');
    });

    it('should sort blogs by name asc', async () => {
      await blogsTestManager.createBlog({
        name: 'Zebra Blog',
        description: 'Description',
        websiteUrl: 'https://zebra.com',
      });

      await blogsTestManager.createBlog({
        name: 'Alpha Blog',
        description: 'Description',
        websiteUrl: 'https://alpha.com',
      });

      const response = await blogsTestManager.getAllBlogs({
        sortBy: 'name',
        sortDirection: 'asc',
      });

      expect(response.body.items[0].name).toBe('Alpha Blog');
      expect(response.body.items[1].name).toBe('Zebra Blog');
    });

    it('should sort blogs by name desc', async () => {
      await blogsTestManager.createBlog({
        name: 'Alpha Blog',
        description: 'Description',
        websiteUrl: 'https://alpha.com',
      });

      await blogsTestManager.createBlog({
        name: 'Zebra Blog',
        description: 'Description',
        websiteUrl: 'https://zebra.com',
      });

      const response = await blogsTestManager.getAllBlogs({
        sortBy: 'name',
        sortDirection: 'desc',
      });

      expect(response.body.items[0].name).toBe('Zebra Blog');
      expect(response.body.items[1].name).toBe('Alpha Blog');
    });

    it('should paginate correctly with pageSize', async () => {
      for (let i = 1; i <= 15; i++) {
        await blogsTestManager.createBlog({
          name: `Blog ${i}`,
          description: `Description ${i}`,
          websiteUrl: `https://blog${i}.com`,
        });
      }

      const page1 = await blogsTestManager.getAllBlogs({
        pageNumber: 1,
        pageSize: 10,
      });

      const page2 = await blogsTestManager.getAllBlogs({
        pageNumber: 2,
        pageSize: 10,
      });

      expect(page1.body.items).toHaveLength(10);
      expect(page2.body.items).toHaveLength(5);
      expect(page1.body.page).toBe(1);
      expect(page2.body.page).toBe(2);
    });
  });


});
