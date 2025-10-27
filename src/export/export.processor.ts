import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { ExportService } from './export.service';
import * as fs from 'fs';
import { join } from 'path';
import { Vehicle } from '../entities/vehicle.entity';
import { NotificationsGateway } from '../notificatios/notifications.gateway';


@Processor('exportQueue')
export class ExportProcessor {
  constructor(private exportService: ExportService,
    private notificationsGateway: NotificationsGateway, // inject gateway
  ) {}

  @Process('processExport')
  async handleExport(job: Job) {
    const { filePath, minAge } = job.data;

    // Ensure exports folder exists
    const exportsDir = join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });

    console.log(`Processing export: ${filePath}, minAge: ${minAge}`);

    // Fetch vehicles
    const vehicles: Vehicle[] = await this.exportService.fetchVehicles(minAge);

    // Convert to CSV
    const header =
      'id,first_name,last_name,email,car_make,car_model,vin,manufactured_date,age_of_vehicle\n';
    const rows = vehicles
      .map(
        (v) =>
          `${v.id},${v.first_name},${v.last_name},${v.email},${v.car_make},${v.car_model},${v.vin},${v.manufactured_date?.toISOString() ?? ''},${v.age_of_vehicle}`
      )
      .join('\n');

    fs.writeFileSync(filePath, header + rows);
    console.log(`Export completed. File saved: ${filePath}`);

      // Send WebSocket notification
    this.notificationsGateway.sendNotification(`Export completed: ${filePath}`);

  
  }
}
