import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Post from '@src/module/blog/domain/post.entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async findById(id: string): Promise<Post | null> {
    return this.postsRepository.findOneBy({ id });
  }

  async save(post: Post): Promise<Post> {
    return this.postsRepository.save(post);
  }

  async deleteById(id: string): Promise<void> {
    await this.postsRepository.delete(id);
  }
}