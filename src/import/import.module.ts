import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Vehicle } from '../entities/vehicle.entity';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { ImportProcessor } from './import.processor';
//import { bullConfig } from '../config/bull.config';


@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    BullModule.registerQueue({
      name: 'importQueue',
     // redis: bullConfig.redis,

      redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
    }),
  ],
  controllers: [ImportController],
  providers: [ImportService, ImportProcessor],
})
export class ImportModule {}
