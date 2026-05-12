import { INestApplication } from '@nestjs/common';

export const GLOBAL_PREFIX = 'api';

export function globalPrefixSetup(app: INestApplication): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.setGlobalPrefix(GLOBAL_PREFIX);
}
