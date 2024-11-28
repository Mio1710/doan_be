import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as ListRepositories from './repositories';
import * as ListServices from './services';
import * as ListControllers from './controllers';
import * as ListEntities from './entities';
import * as ListCommands from './commands';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import DatabaseConfig from './configs/database.config';
import { JwtModule } from '@nestjs/jwt';
import { CommandRunnerModule } from 'nest-commander';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';
import { ClsModule } from 'nestjs-cls';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestInterceptor } from './interceptors/request.interceptor';
// import { APP_GUARD, Reflector } from '@nestjs/core';
// import { RolesGuard } from './guards/roles.guard';
import * as ListUtils from './utils';
import { BaseSubscriber } from './subscribers/base.subscribe';
import { config } from 'dotenv';
config();
console.log('env', process.env);


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [DatabaseConfig],
    }),
    TypeOrmModule.forFeature([...Object.values(ListEntities)]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    CommandRunnerModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
  ],
  controllers: [AppController, ...Object.values(ListControllers)],
  providers: [
    AppService,
    ...Object.values(ListRepositories),
    ...Object.values(ListServices),
    ...Object.values(ListCommands),
    ...Object.values(ListUtils),
    HttpExceptionFilter,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
    BaseSubscriber,
  ],
})
export class AppModule {}
