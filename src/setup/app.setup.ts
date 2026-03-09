import { pipesSetup } from './pipes.setup';
import { INestApplication } from '@nestjs/common';
import { globalPrefixSetup } from './global-prefix.setup';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  globalPrefixSetup(app);
}
