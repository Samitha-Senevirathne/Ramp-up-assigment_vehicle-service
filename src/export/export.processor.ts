import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { ExportService } from './export.service';
import * as fs from 'fs';
import { join } from 'path';
import { Vehicle } from '../entities/vehicle.entity';
import { NotificationsGateway } from '../notificatios/notifications.gateway';
import { Logger } from '@nestjs/common';

@Processor('exportQueue')
export class ExportProcessor {
  private readonly logger = new Logger(ExportProcessor.name);

  constructor(
    private exportService: ExportService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  @Process('processExport')
  async handleExport(job: Job) {
    const { filePath, minAge, userId } = job.data;
    const exportsDir = join(process.cwd(), 'exports');

    try {
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
        this.logger.log(`Created exports directory at: ${exportsDir}`);
      }

      this.logger.log(`Starting export process for user: ${userId}`);

      const vehicles: Vehicle[] = await this.exportService.fetchVehicles(minAge);
      this.logger.log(`Fetched ${vehicles.length} vehicle records for export`);

      const header =
        'id,first_name,last_name,email,car_make,car_model,vin,manufactured_date,age_of_vehicle\n';
      const rows = vehicles
        .map(
          (v) =>
            `${v.id},${v.first_name},${v.last_name},${v.email},${v.car_make},${v.car_model},${v.vin},${v.manufactured_date?.toISOString() ?? ''},${v.age_of_vehicle}`,
        )
        .join('\n');

      fs.writeFileSync(filePath, header + rows);
      this.logger.log(`Export completed successfully: ${filePath}`);

      const fileName = filePath.split('\\').pop() || filePath.split('/').pop();
      const downloadUrl = `http://localhost:3000/export/download/${fileName}`;

      if (userId) {
        this.notificationsGateway.sendNotificationToUser(
          userId,
          `Export completed. <a href="${downloadUrl}" target="_blank">Click here to download</a>`,
        );
        this.logger.log(`Notification sent to user ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Error during export process: ${error.message}`, error.stack);

      // Notify user if something went wrong
      if (userId) {
        this.notificationsGateway.sendNotificationToUser(
          userId,
          `Export failed. Please try again later.`,
        );
      }
    }
  }
}
