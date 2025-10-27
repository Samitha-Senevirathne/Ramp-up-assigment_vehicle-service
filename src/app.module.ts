// import { Module } from '@nestjs/common';
// import { AppService } from './app.service';
// import { VehicleModule } from './vehicle/vehicle.module';
// import { GraphQLModule } from '@nestjs/graphql';
// import { join } from 'path';
// import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
// import { TypeOrmModule } from '@nestjs/typeorm';

// @Module({
//   imports: [VehicleModule,
// GraphQLModule.forRoot<ApolloDriverConfig>({
//   driver: ApolloDriver,
//   autoSchemaFile: join(process.cwd(), 'src/graphql-schema.gql'),}
// ),
//   TypeOrmModule.forRoot({
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: 'postgres',
//   password: 'Sam',
//   database: 'vehicle_db',
//   entities: [__dirname + '/**/*.entity{.ts,.js}'],
//   synchronize: true,
// })

// ],
//   controllers: [],
//   providers: [AppService],
// })
// export class AppModule {}


// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ImportModule } from './import/import.module';
// import { Vehicle } from './entities/vehicle.entity';
// import { databaseConfig } from './config/database.config';
// import { BullModule } from '@nestjs/bull';
// import { bullConfig } from './config/bull.config';
// import { ExportModule } from './export/export.module';
// import { NotificationsModule } from './notificatios/notificatios.module';
// import { VehicleModule } from './vehicle/vehicle.module';

// @Module({
//   imports: [
//     VehicleModule,
//     TypeOrmModule.forRoot(databaseConfig),
//     BullModule.forRoot({ redis: bullConfig.redis }),
//     ImportModule,
//     ExportModule,
//     NotificationsModule,
//   ],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bull';
import { join } from 'path';

import { ImportModule } from './import/import.module';
import { ExportModule } from './export/export.module';
import { NotificationsModule } from './notificatios/notificatios.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { Vehicle } from './entities/vehicle.entity';
//import { databaseConfig } from './config/database.config';
//import { bullConfig } from './config/bull.config';

@Module({
  imports: [
    //TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forRoot ({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'Sam',
      database: process.env.DB_NAME || 'vehicle_db',
      entities: [Vehicle],
      synchronize: true,
}),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true, // enables browser GraphQL UI
    }),

    BullModule.forRoot({ 
      redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },}),

    VehicleModule,
    ImportModule,
    ExportModule,
    NotificationsModule,
  ],
})
export class AppModule {}

