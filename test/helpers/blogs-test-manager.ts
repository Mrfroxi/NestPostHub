import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import supertest from 'supertest';

export interface CreateBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
}

export interface CreatePostDto {
  title: string;
  shortDescription: string;
  content: string;
}

export interface GetPostsQueryParams {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
}

export class BlogsTestManager {
  constructor(private app: INestApplication) {}

  async createBlog(
    dto: CreateBlogDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs`)
      .send(dto)
      .expect(statusCode);
  }

  async createPostForBlog(
    blogId: string,
    dto: CreatePostDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs/${blogId}/posts`)
      .send(dto)
      .expect(statusCode);
  }

  async getPostsForBlog(
    blogId: string,
    params: GetPostsQueryParams = {},
    statusCode: number = HttpStatus.OK,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs/${blogId}/posts`)
      .query(params)
      .expect(statusCode);
  }
}
