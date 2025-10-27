import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { Vehicle } from '../entities/vehicle.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import csvParser from 'csv-parser';
import * as fs from 'fs';

@Processor('importQueue')
@Injectable()
export class ImportProcessor {
  private readonly logger = new Logger(ImportProcessor.name);

  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
  ) {}

  @Process('processImport')
  async handleImport(job: Job) {         //job is the Bull Job object; job.data holds payload.
    const { filePath } = job.data;
    this.logger.log(`Processing import for file: ${filePath}`);

    const vehicles: Vehicle[] = [];

    return new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          const age = row.manufactured_date
            ? new Date().getFullYear() - new Date(row.manufactured_date).getFullYear()
            : null;

          vehicles.push({
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            car_make: row.car_make,
            car_model: row.car_model,
            vin: row.vin,
            manufactured_date: row.manufactured_date ? new Date(row.manufactured_date) : null,
            age_of_vehicle: age,
          } as Vehicle);
        })
        .on('end', async () => {
          // Save all vehicles to DB
          await this.vehicleRepo.save(vehicles);
          this.logger.log(`Imported ${vehicles.length} vehicles successfully.`);
          resolve();
        })
        .on('error', (err) => {
          this.logger.error('Error processing CSV file', err);
          reject(err);
        });
    });
  }
}
