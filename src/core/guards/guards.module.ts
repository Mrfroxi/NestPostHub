import { Module } from '@nestjs/common';
import { BasicConfigStrategy } from './strategies/basic.strategy';

@Module({
  providers: [BasicConfigStrategy],
  exports: [BasicConfigStrategy],
})
export class GuardsModule {}
