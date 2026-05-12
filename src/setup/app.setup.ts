import { INestApplication } from '@nestjs/common';
import { globalPrefixSetup } from './global-prefix.setup';
import { pipesSetup } from '@src/setup/pipes.setup';

export function appSetup(app: INestApplication) {
  app.enableCors();

  pipesSetup(app);

  globalPrefixSetup(app);
}
