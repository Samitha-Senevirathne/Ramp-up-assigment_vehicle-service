// import { Processor, Process } from '@nestjs/bull';
// import type { Job } from 'bull';
// import { ExportService } from './export.service';
// import * as fs from 'fs';
// import { join } from 'path';
// import { Vehicle } from '../entities/vehicle.entity';
// import { NotificationsGateway } from '../notificatios/notifications.gateway';

// @Processor('exportQueue')
// export class ExportProcessor {
//   constructor(
//     private exportService: ExportService,
//     private notificationsGateway: NotificationsGateway, // gateway
//   ) {}

//   @Process('processExport')
//   async handleExport(job: Job) {
//     const { filePath, minAge, userId } = job.data;

//     // Ensure exports folder exists
//     const exportsDir = join(process.cwd(), 'exports');
//     if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });

//     console.log(`Processing export: ${filePath}, minAge: ${minAge}, userId: ${userId}`);

//     // Fetch vehicles
//     const vehicles: Vehicle[] = await this.exportService.fetchVehicles(minAge);

//     // Convert to CSV
//     const header =
//       'id,first_name,last_name,email,car_make,car_model,vin,manufactured_date,age_of_vehicle\n';
//     const rows = vehicles
//       .map(
//         (v) =>
//           `${v.id},${v.first_name},${v.last_name},${v.email},${v.car_make},${v.car_model},${v.vin},${v.manufactured_date?.toISOString() ?? ''},${v.age_of_vehicle}`
//       )
//       .join('\n');

//     fs.writeFileSync(filePath, header + rows);
//     console.log(`Export completed. File saved: ${filePath}`);

//     // Send notification to specific user
//     if (userId) {
//       this.notificationsGateway.sendNotificationToUser(userId, `Export completed ${filePath}`);
//     }
//   }
// }


// export.processor.ts
// import { Processor, Process } from '@nestjs/bull';
// import type { Job } from 'bull';
// import { ExportService } from './export.service';
// import * as fs from 'fs';
// import { join } from 'path';
// import { Vehicle } from '../entities/vehicle.entity';
// import { NotificationsGateway } from '../notificatios/notifications.gateway';

// @Processor('exportQueue')
// export class ExportProcessor {
//   constructor(
//     private exportService: ExportService,
//     private notificationsGateway: NotificationsGateway,
//   ) {}

//   @Process('processExport')
//   async handleExport(job: Job) {
//     const { filePath, minAge, userId } = job.data;
//     const exportsDir = join(process.cwd(), 'exports');
//     if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });

//     console.log(`Processing export: ${filePath}, minAge: ${minAge}, userId: ${userId}`);

//     const vehicles: Vehicle[] = await this.exportService.fetchVehicles(minAge);

//     const header =
//       'id,first_name,last_name,email,car_make,car_model,vin,manufactured_date,age_of_vehicle\n';
//     const rows = vehicles
//       .map(
//         (v) =>
//           `${v.id},${v.first_name},${v.last_name},${v.email},${v.car_make},${v.car_model},${v.vin},${v.manufactured_date?.toISOString() ?? ''},${v.age_of_vehicle}`,
//       )
//       .join('\n');

//     fs.writeFileSync(filePath, header + rows);
//     console.log(`Export completed: ${filePath}`);

//     const fileName = filePath.split('\\').pop();
//     const downloadUrl = `http://localhost:3000/exports/${fileName}`;

//     // Send notification with download URL
//     if (userId) {
//      // export.processor.ts
// this.notificationsGateway.sendNotificationToUser(
//   userId,
//   `Export completed. Click to download: http://localhost:3000/export/download/${filePath.split('/').pop()}`
// );

//     }
//   }
// }


import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { ExportService } from './export.service';
import * as fs from 'fs';
import { join } from 'path';
import { Vehicle } from '../entities/vehicle.entity';
import { NotificationsGateway } from '../notificatios/notifications.gateway';

@Processor('exportQueue')
export class ExportProcessor {
  constructor(
    private exportService: ExportService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  @Process('processExport')
  async handleExport(job: Job) {
    const { filePath, minAge, userId } = job.data;
    const exportsDir = join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });

    console.log(`Processing export for user ${userId}...`);

    const vehicles: Vehicle[] = await this.exportService.fetchVehicles(minAge);

    const header =
      'id,first_name,last_name,email,car_make,car_model,vin,manufactured_date,age_of_vehicle\n';
    const rows = vehicles
      .map(
        (v) =>
          `${v.id},${v.first_name},${v.last_name},${v.email},${v.car_make},${v.car_model},${v.vin},${v.manufactured_date?.toISOString() ?? ''},${v.age_of_vehicle}`,
      )
      .join('\n');

    fs.writeFileSync(filePath, header + rows);
    console.log(`Export completed: ${filePath}`);

    const fileName = filePath.split('\\').pop() || filePath.split('/').pop();
    const downloadUrl = `http://localhost:3000/export/download/${fileName}`;

    if (userId) {
      this.notificationsGateway.sendNotificationToUser(
        userId,
        `Export completed. <a href="${downloadUrl}" target="_blank">Click here to download</a>`,
      );
    }
  }
}

