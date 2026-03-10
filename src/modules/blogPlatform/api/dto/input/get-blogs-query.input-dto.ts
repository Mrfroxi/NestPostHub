import { BaseQueryParams } from '../../../../../core/dto/base.query.sort-params.input-dto';

export class GetBlogsQueryInputDto extends BaseQueryParams {
  searchNameTerm: string | null = null;

  sortBy: BlogSortBy = BlogSortBy.createdAt;
}

export enum BlogSortBy {
  createdAt = 'createdAt',
}
