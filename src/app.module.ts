import { configModule } from '@src/config-dynamic-module';
import { CoreConfig } from '@core/core.config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from '@core/core.module';

@Module({
  imports: [
    configModule,
    CoreModule,
    TypeOrmModule.forRootAsync({
      useFactory: (config: CoreConfig) => ({
        type: 'postgres',
        host: config.host,
        port: config.dbPort,
        username: config.username,
        password: config.password,
        database: config.dbName,
        entities: [],
        synchronize: true,
      }),
      inject: [CoreConfig],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
