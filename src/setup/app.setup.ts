import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { globalPrefixSetup } from './global-prefix.setup';
import { pipesSetup } from '@src/setup/pipes.setup';

export function appSetup(app: INestApplication) {
  app.enableCors();
  app.use(cookieParser());

  pipesSetup(app);

  globalPrefixSetup(app);
}
