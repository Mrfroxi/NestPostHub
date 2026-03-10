import { BaseQueryParams } from '../../../../../core/dto/base.query.sort-params.input-dto';

export class GetPostsQueryInputDto extends BaseQueryParams {
  sortBy: PostSortBy = PostSortBy.createdAt;
}

export enum PostSortBy {
  createdAt = 'createdAt',
}
