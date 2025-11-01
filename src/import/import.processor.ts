import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { Vehicle } from '../entities/vehicle.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import csvParser from 'csv-parser';
import * as fs from 'fs';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Processor('importQueue')
@Injectable()
export class ImportProcessor {
  private readonly logger = new Logger(ImportProcessor.name);

  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
  ) {}

  @Process('processImport')
  async handleImport(job: Job) {
    const { filePath } = job.data;
    this.logger.log(`Starting import for file: ${filePath}`);

    const rows: any[] = []; //temporary storage for CSV rows

    return new Promise<void>((resolve, reject) => {
      //Read CSV
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          rows.push(row); // just collect the rows
        })
        .on('end', async () => {
          this.logger.log(`CSV read finished. Validating ${rows.length} rows...`);

          const validVehicles: Vehicle[] = [];
          let skippedInvalid = 0;

          //Validate each row
          for (const row of rows) {
            const dto = plainToInstance(CreateVehicleDto, {
              first_name: row.first_name,
              last_name: row.last_name,
              email: row.email,
              car_make: row.car_make,
              car_model: row.car_model,
              vin: row.vin,
              manufactured_date: row.manufactured_date ? new Date(row.manufactured_date) : null,
            });

            const errors = await validate(dto);

            if (errors.length > 0) {
              skippedInvalid++;
              this.logger.warn(`Skipping invalid row: ${row.vin || 'No VIN'}`);
              continue;
            }

            const age = dto.manufactured_date
              ? new Date().getFullYear() - dto.manufactured_date.getFullYear()
              : null;

            validVehicles.push({
              ...dto,
              age_of_vehicle: age,
            } as Vehicle);
          }

          this.logger.log(`Validation finished. Inserting ${validVehicles.length} vehicles.`);

          //Insert into database, handle duplicates
          let inserted = 0;
          for (const vehicle of validVehicles) {
            try {
              await this.vehicleRepo.insert(vehicle);
              inserted++;
            } catch (err: any) {
              if (err.code === '23505') {
                this.logger.warn(`Duplicate VIN skipped: ${vehicle.vin}`);
              } else {
                this.logger.error(`Error inserting vehicle: ${vehicle.vin}`, err);
              }
            }
          }

          this.logger.log(
            `Import done! Inserted: ${inserted}, Skipped invalid: ${skippedInvalid}, Skipped duplicates: ${validVehicles.length - inserted}`,
          );
          resolve();
        })
        .on('error', (err) => {
          this.logger.error('Error reading CSV', err);
          reject(err);
        });
    });
  }
}
