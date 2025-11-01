// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { GraphQLModule } from '@nestjs/graphql';
// import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
// import { BullModule } from '@nestjs/bull';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';

// import { ImportModule } from './import/import.module';
// import { ExportModule } from './export/export.module';
// import { NotificationsModule } from './notificatios/notificatios.module';
// import { VehicleModule } from './vehicle/vehicle.module';
// import { Vehicle } from './entities/vehicle.entity';

// @Module({
//   imports: [
//     //Serve exported CSVs via HTTP 
//     ServeStaticModule.forRoot({
//       rootPath: join(__dirname, '..', 'exports'),
//       serveRoot: '/exports', // Accessible at http://localhost:3000/exports/filename.csv
//     }),

//     //PostgreSQL Configuration
//     TypeOrmModule.forRoot({
//       type: 'postgres',
//       host: process.env.DB_HOST || 'localhost',
//       port: parseInt(process.env.DB_PORT || '5432'),
//       username: process.env.DB_USER || 'postgres',
//       password: process.env.DB_PASS || 'Sam',
//       database: process.env.DB_NAME || 'vehicle_db',
//       entities: [Vehicle],
//       synchronize: true,
//     }),

//     // GraphQL Setup
//     GraphQLModule.forRoot<ApolloDriverConfig>({
//       driver: ApolloDriver,
//       autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
//       playground: true,
//     }),

//     /** ✅ Redis Queue Setup */
//     BullModule.forRoot({
//       redis: {
//         host: process.env.REDIS_HOST || 'localhost',
//         port: parseInt(process.env.REDIS_PORT || '6379'),
//       },
//     }),

//     /** ✅ Application Modules */
//     VehicleModule,
//     ImportModule,
//     ExportModule,
//     NotificationsModule,
//   ],
// })
// export class AppModule {}



import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bull';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ImportModule } from './import/import.module';
import { ExportModule } from './export/export.module';
import { NotificationsModule } from './notificatios/notificatios.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { Vehicle } from './entities/vehicle.entity';

@Module({
  imports: [
    // Serve exported CSVs via HTTP
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'exports'),
      serveRoot: '/exports', // can be access at http://localhost:3000/exports/filename.csv
    }),

    //PostgreSQL Configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'Sam',
      database: process.env.DB_NAME || 'vehicle_db',
      entities: [Vehicle],
      synchronize: true,
    }),

    //Apollo Federation (Subgraph) GraphQL Setup
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
        path: join(process.cwd(), 'src/graphql-schema.gql'),
      },
      playground: true,
    }),

    // Redis Queue Setup
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),

    //Application Modules
    VehicleModule,
    ImportModule,
    ExportModule,
    NotificationsModule,
  ],
})
export class AppModule {}
