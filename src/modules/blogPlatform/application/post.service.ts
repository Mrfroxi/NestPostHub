import { Injectable } from '@nestjs/common';
import { PostRepository } from '../infastructure/post.repository';
import { CreatePostDto } from '../domain/dto/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/post.entity';
import type { PostModelType } from '../domain/post.entity';
import { UpdatePostDto } from '../domain/dto/update-post.dto';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private readonly PostRepository: PostRepository,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const post: PostDocument = this.PostModel.createInstance(dto);

    await this.PostRepository.save(post);

    return post.getId;
  }

  async updateById(id: string, updatePostDto: UpdatePostDto): Promise<string> {
    const post: PostDocument | null =
      await this.PostRepository.findOrNotFoundFail(id);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'post not found', field: 'post' }],
      });
    }

    post.update(updatePostDto);

    await this.PostRepository.save(post);

    return post.getId;
  }

  async deleteById(id: string): Promise<void> {
    const post: PostDocument | null =
      await this.PostRepository.findOrNotFoundFail(id);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [{ message: 'post not found', field: 'post' }],
      });
    }

    post.makeDeleted();

    await this.PostRepository.save(post);
  }
}
