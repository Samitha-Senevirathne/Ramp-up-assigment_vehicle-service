// import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
// import { Vehicle } from "../entities/vehicle.entity";

// export const databaseConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: process.env.DB_HOST || 'localhost',
//   port: parseInt(process.env.DB_PORT || '5432'),
//   username: process.env.DB_USER || 'postgres',
//   password: process.env.DB_PASS || 'Sam',
//   database: process.env.DB_NAME || 'vehicle_db',
//   entities: [Vehicle],
//   synchronize: true,
// };