import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Comment from '@src/module/blog/domain/comment.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async findById(id: string): Promise<Comment | null> {
    return this.commentsRepository.findOneBy({ id });
  }

  async save(comment: Comment): Promise<Comment> {
    return this.commentsRepository.save(comment);
  }
}
