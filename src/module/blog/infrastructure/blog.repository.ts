import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Blog from '@src/module/blog/domain/blog.entity';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
  ) {}

  async findById(id: string): Promise<Blog | null> {
    return this.blogsRepository.findOneBy({ id });
  }

  async save(blog: Blog): Promise<Blog> {
    return this.blogsRepository.save(blog);
  }

  async deleteById(id: string): Promise<void> {
    await this.blogsRepository.delete(id);
  }
}