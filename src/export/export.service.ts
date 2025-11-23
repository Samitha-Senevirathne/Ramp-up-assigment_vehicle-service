import { Injectable,Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { join } from 'path';
import { error } from 'console';

@Injectable()
export class ExportService {
      private logger = new Logger('ExportService');
    
  constructor(
    @InjectQueue('exportQueue') private exportQueue: Queue,
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
  ) {}



  async queueExport (minAge?: number, userId?: string){

    try{
         const filePath = join(process.cwd(), 'exports', `export-${Date.now()}.csv`);
    await this.exportQueue.add('processExport', { filePath, minAge, userId }); //pass userId
    return { message: 'Export job queued', filePath };
    }catch(error){
        this.logger.error('Error queuing the exportjob',error);
        throw new error('failed to queue the exportjob');

    }
  }



  async fetchVehicles(minAge?: number) {
  try {
    if (minAge) {
      return await this.vehicleRepo.find({ where: { age_of_vehicle: MoreThanOrEqual(minAge) } });
    }
    return await this.vehicleRepo.find();
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw new Error('Failed to fetch vehicles'); // Let controller handle this error
  }
}
}
