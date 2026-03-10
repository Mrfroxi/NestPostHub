import { PostDocument } from '../../../domain/post.entity';

export class PostOutputDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: Array<{
      userId: string;
      login: string;
      addedAt: Date;
    }>;
  };

  static mapToOut(post: PostDocument): PostOutputDto {
    const dto = new this();
    dto.id = post.getId;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.extendedLikesInfo = post.extendedLikesInfo;
    dto.createdAt = post.createdAt;

    return dto;
  }
}
