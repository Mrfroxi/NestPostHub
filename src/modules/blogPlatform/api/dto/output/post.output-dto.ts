import { PostDocument } from '../../../domain/post.entity';

export class PostOutputDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: Date;

  static mapToOut(post: PostDocument): PostOutputDto {
    const dto = new this();
    dto.id = post.getId;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.createdAt = post.createdAt;

    return dto;
  }
}
