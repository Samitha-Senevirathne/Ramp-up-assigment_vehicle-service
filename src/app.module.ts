import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { VehicleModule } from './vehicle/vehicle.module';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [VehicleModule,
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/graphql-schema.gql'),}
),
  TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Sam',
  database: 'vehicle_db',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
})

],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
