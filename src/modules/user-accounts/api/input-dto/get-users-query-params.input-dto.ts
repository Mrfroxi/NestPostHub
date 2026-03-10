import { UsersSortBy } from './users-sort-by';
import { BaseQueryParams } from '../../../../core/dto/base.query.sort-params.input-dto';

export class GetUsersQueryParams extends BaseQueryParams {
  sortBy: UsersSortBy = UsersSortBy.CreatedAt;

  searchLoginTerm: string | null = null;

  searchEmailTerm: string | null = null;

  pageNumber: number = 1;
}
