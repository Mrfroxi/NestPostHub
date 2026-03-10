import { UserDocument } from '../../domain/user.entity';

export class UserOutputDtoDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: UserDocument): UserOutputDtoDto {
    const dto = new UserOutputDtoDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.id = user._id.toString();
    dto.createdAt = user.createdAt;

    return dto;
  }
}
