import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { ExportProcessor } from './export.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { BullModule } from '@nestjs/bull';
import { NotificationsModule } from '../notificatios/notificatios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    BullModule.registerQueue({ name: 'exportQueue' }),
    NotificationsModule, // important!
  ],
  providers: [ExportService, ExportProcessor],
  controllers: [ExportController],
})
export class ExportModule {}
