import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/post.entity';
import type { PostModelType } from '../domain/post.entity';

@Injectable()
export class PostRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }

  async findOrNotFoundFail(id: string): Promise<PostDocument> {
    const post: PostDocument | null = await this.PostModel.findById(id);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }
}
