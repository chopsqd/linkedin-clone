import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FeedModule } from "./feed/feed.module";
import { AuthModule } from "./auth/auth.module";
import * as process from "process";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "./core/all-exceptions.filter";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: parseInt(<string>process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: true
    }),
    FeedModule,
    AuthModule
  ],
  providers: [{
    provide: APP_FILTER,
    useClass: AllExceptionsFilter
  }]
})
export class AppModule {
}
