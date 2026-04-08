import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtPublicAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
