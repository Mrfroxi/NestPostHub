import { BaseQueryParams } from '../../../../../core/dto/base.query.sort-params.input-dto';

export class GetCommentsQueryInputDto extends BaseQueryParams {
  sortBy: CommentSortBy = CommentSortBy.createdAt;
}

export enum CommentSortBy {
  createdAt = 'createdAt',
}
