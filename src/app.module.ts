import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayersModule } from './players/players.module';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { ChallengeModule } from './challenges/challenge.module';

@Module({
  imports: [
    PlayersModule,
    ConfigModule.forRoot({ envFilePath: '.env' }),
    MongooseModule.forRoot(`${process.env.MONGODB_URL}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    CategoriesModule,
    ChallengeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
