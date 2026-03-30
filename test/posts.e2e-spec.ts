import { INestApplication } from '@nestjs/common';
import { PostsTestManager } from './helpers/posts-test-manager';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../src/modules/blogPlatform/domain/post.entity';
import { Blog } from '../src/modules/blogPlatform/domain/blog.entity';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';


describe('posts', () => {
  let app: INestApplication;
  let postsTestManager: PostsTestManager;
  let blogsTestManager: BlogsTestManager;
  let postModel: Model<any>;
  let blogModel: Model<any>;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    postsTestManager = result.postsTestManager;
    blogsTestManager = result.blogsTestManager;
    postModel = app.get<Model<any>>(getModelToken(Post.name));
    blogModel = app.get<Model<any>>(getModelToken(Blog.name));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  describe('POST /posts', () => {
    const validPostData = {
      title: 'Test Post',
      shortDescription: 'Short Description',
      content: 'Full Content',
      blogId: '',
    };

    it('should create post and return 201', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      const response = await postsTestManager.createPost({
        ...validPostData,
        blogId: blog.body.id,
      });

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

    it('should return 401 if not authorized', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/posts`)
        .send({ ...validPostData, blogId: blog.body.id })
        .expect(401);
    });

    it('should return 404 if blog not found', async () => {
      const fakeBlogId = '507f1f77bcf86cd799439011';

      await postsTestManager.createPost(
        { ...validPostData, blogId: fakeBlogId },
        404
      );
    });

    it('should return 400 if title is invalid', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await postsTestManager.createPost(
        { ...validPostData, blogId: blog.body.id, title: '' },
        400
      );
    });

    it('should return 400 if shortDescription is invalid', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await postsTestManager.createPost(
        { ...validPostData, blogId: blog.body.id, shortDescription: '' },
        400
      );
    });

    it('should return 400 if content is invalid', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await postsTestManager.createPost(
        { ...validPostData, blogId: blog.body.id, content: '' },
        400
      );
    });
  });

  describe('GET /posts', () => {
    it('should return empty array when no posts', async () => {
      const response = await postsTestManager.getAllPosts();

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

      await postsTestManager.createPost({
        title: 'Post 1',
        shortDescription: 'Desc 1',
        content: 'Content 1',
        blogId: blog.body.id,
      });

      await postsTestManager.createPost({
        title: 'Post 2',
        shortDescription: 'Desc 2',
        content: 'Content 2',
        blogId: blog.body.id,
      });

      const response = await postsTestManager.getAllPosts({
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

      await postsTestManager.createPost({
        title: 'First Post',
        shortDescription: 'Desc 1',
        content: 'Content 1',
        blogId: blog.body.id,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      await postsTestManager.createPost({
        title: 'Second Post',
        shortDescription: 'Desc 2',
        content: 'Content 2',
        blogId: blog.body.id,
      });

      const response = await postsTestManager.getAllPosts({
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

      await postsTestManager.createPost({
        title: 'First Post',
        shortDescription: 'Desc 1',
        content: 'Content 1',
        blogId: blog.body.id,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      await postsTestManager.createPost({
        title: 'Second Post',
        shortDescription: 'Desc 2',
        content: 'Content 2',
        blogId: blog.body.id,
      });

      const response = await postsTestManager.getAllPosts({
        sortDirection: 'asc',
      });

      expect(response.body.items[0].title).toBe('First Post');
      expect(response.body.items[1].title).toBe('Second Post');
    });

    it('should paginate correctly with pageSize', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      for (let i = 1; i <= 15; i++) {
        await postsTestManager.createPost({
          title: `Post ${i}`,
          shortDescription: `Desc ${i}`,
          content: `Content ${i}`,
          blogId: blog.body.id,
        });
      }

      const page1 = await postsTestManager.getAllPosts({
        pageNumber: 1,
        pageSize: 10,
      });

      const page2 = await postsTestManager.getAllPosts({
        pageNumber: 2,
        pageSize: 10,
      });

      expect(page1.body.items).toHaveLength(10);
      expect(page2.body.items).toHaveLength(5);
      expect(page1.body.page).toBe(1);
      expect(page2.body.page).toBe(2);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return post by id', async () => {
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

      const response = await postsTestManager.getPostById(post.body.id);

      expect(response.body).toEqual({
        id: post.body.id,
        title: 'Test Post',
        shortDescription: 'Description',
        content: 'Content',
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

    it('should return 404 if post not found', async () => {
      const fakePostId = '507f1f77bcf86cd799439011';

      await postsTestManager.getPostById(fakePostId, 404);
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update post and return 204', async () => {
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

      await postsTestManager.updatePost(post.body.id, {
        title: 'Updated Post',
        shortDescription: 'Updated Description',
        content: 'Updated Content',
        blogId: blog.body.id,
      });

      const updatedPost = await postsTestManager.getPostById(post.body.id);

      expect(updatedPost.body).toEqual({
        id: post.body.id,
        title: 'Updated Post',
        shortDescription: 'Updated Description',
        content: 'Updated Content',
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

    it('should return 404 if post not found', async () => {
      const blog = await blogsTestManager.createBlog({
        name: 'Test Blog',
        description: 'Description',
        websiteUrl: 'https://test.com',
      });

      await postsTestManager.updatePost(
        '507f1f77bcf86cd799439011',
        {
          title: 'Valid Title',
          shortDescription: 'Valid Description',
          content: 'Valid Content',
          blogId: blog.body.id,
        },
        404
      );
    });

    it('should return 400 if title is invalid', async () => {
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

      await postsTestManager.updatePost(
        post.body.id,
        { title: '' },
        400
      );
    });

    it('should return 400 if shortDescription is invalid', async () => {
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

      await postsTestManager.updatePost(
        post.body.id,
        { shortDescription: '' },
        400
      );
    });

    it('should return 400 if content is invalid', async () => {
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

      await postsTestManager.updatePost(
        post.body.id,
        { content: '' },
        400
      );
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
        .put(`/${GLOBAL_PREFIX}/posts/${post.body.id}`)
        .send({ title: 'Updated' })
        .expect(401);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete post and return 204', async () => {
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

      await postsTestManager.deletePost(post.body.id);

      await postsTestManager.getPostById(post.body.id, 404);
    });

    it('should return 404 if post not found', async () => {
      const fakePostId = '507f1f77bcf86cd799439011';

      await postsTestManager.deletePost(fakePostId, 404);
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
        .delete(`/${GLOBAL_PREFIX}/posts/${post.body.id}`)
        .expect(401);
    });
  });

});
