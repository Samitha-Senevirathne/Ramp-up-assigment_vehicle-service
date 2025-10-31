// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, MoreThanOrEqual } from 'typeorm';
// import { Vehicle } from '../entities/vehicle.entity';
// import { InjectQueue } from '@nestjs/bull';
// import type { Queue } from 'bull';
// import { join } from 'path';

// @Injectable()
// export class ExportService {
//   constructor(
//     @InjectQueue('exportQueue') private exportQueue: Queue,
//     @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
//   ) {}

//   // Add export job to queue
//   async queueExport(minAge?: number) {
//     const filePath = join(process.cwd(), 'exports', `export-${Date.now()}.csv`);
//     await this.exportQueue.add('processExport', { filePath, minAge });
//     return { message: 'Export job queued', filePath };
//   }

//   // Fetch vehicles
//   async fetchVehicles(minAge?: number) {
//     if (minAge) {
//       return this.vehicleRepo.find({ where: { age_of_vehicle: MoreThanOrEqual(minAge) } });
//     }
//     return this.vehicleRepo.find();
//   }


  
// }



// export.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { join } from 'path';

@Injectable()
export class ExportService {
  constructor(
    @InjectQueue('exportQueue') private exportQueue: Queue,
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
  ) {}

  async queueExport(minAge?: number, userId?: string) {
    const filePath = join(process.cwd(), 'exports', `export-${Date.now()}.csv`);
    await this.exportQueue.add('processExport', { filePath, minAge, userId }); // pass userId
    return { message: 'Export job queued', filePath };
  }

  async fetchVehicles(minAge?: number) {
    if (minAge) {
      return this.vehicleRepo.find({ where: { age_of_vehicle: MoreThanOrEqual(minAge) } });
    }
    return this.vehicleRepo.find();
  }
}
