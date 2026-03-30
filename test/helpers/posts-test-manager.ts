import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import supertest from 'supertest';

export interface CreatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export interface CreateCommentDto {
  content: string;
}

export interface GetPostsQueryParams {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
}

export class PostsTestManager {
  constructor(private app: INestApplication) {}

  async createPost(
    dto: CreatePostDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts`)
      .auth('admin', 'qwerty')
      .send(dto)
      .expect(statusCode);
  }

  async getPostById(
    id: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/posts/${id}`)
      .expect(statusCode);
  }

  async updatePost(
    id: string,
    dto: Partial<CreatePostDto>,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${id}`)
      .auth('admin', 'qwerty')
      .send(dto)
      .expect(statusCode);
  }

  async deletePost(
    id: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/posts/${id}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }

  async getAllPosts(
    params: GetPostsQueryParams = {},
    statusCode: number = HttpStatus.OK,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/posts`)
      .query(params)
      .expect(statusCode);
  }

  async createCommentForPost(
    postId: string,
    dto: CreateCommentDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<supertest.Response> {
    return request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts/${postId}/comments`)
      .auth('admin', 'qwerty')
      .send(dto)
      .expect(statusCode);
  }

}
