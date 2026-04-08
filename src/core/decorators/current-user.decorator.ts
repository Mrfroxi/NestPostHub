import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithUser {
  user: { login: string; userId: string };
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): { login: string; userId: string } => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const user = request.user;

    if (!user) {
      throw new Error('there is no user in the request object!');
    }

    return user;
  },
);

export const CurrentPublicUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): { login: string; userId: string } | null => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const user = request.user;

    if (!user) {
      return null;
    }

    return user;
  },
);
