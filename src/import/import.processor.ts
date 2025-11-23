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
    const { filePath } = job.data; //Get the csv file path from the job
    this.logger.log(`Starting to import file: ${filePath}`);

    const rows: any[] = []; //To store all rows from the CSV
    let rowNumber = 2; 

    return new Promise<void>((resolve, reject) => {
      //create stream to read dfile
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          // Add row and its number to the rows array
          rows.push({ ...row, _rowNumber: rowNumber });
          rowNumber++;
        })
        .on('end', async () => {
          this.logger.log(`CSV file read complete. Rows to process: ${rows.length}`);

          const validVehicles: Array<Vehicle & { _rowNumber: number }> = [];
          const invalidRows: Array<{ rowNumber: number; reason: string; data: any }> = [];

          this.logger.log('Validating each CSV row...');

          //Validate all rows one by one
          for (const row of rows) {
            //Convert plain CSV row to CreateVehicleDto object
            const dto = plainToInstance(CreateVehicleDto, {
              first_name: row.first_name,
              last_name: row.last_name,
              email: row.email,
              car_make: row.car_make,
              car_model: row.car_model,
              vin: row.vin,
              manufactured_date: row.manufactured_date ? new Date(row.manufactured_date) : null,
            });

            //check for validation errors
            const errors = await validate(dto);
            if (errors.length) {
              const messages = errors
                .map(err => Object.values(err.constraints || {}).join(', '))
                .join('; ');

              invalidRows.push({
                rowNumber: row._rowNumber,
                reason: messages,
                data: {
                  vin: row.vin || 'N/A',
                  email: row.email || 'N/A',
                  name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'N/A',
                },
              });
              continue; // Skip invalid row
            }

            //Calculate vehicle age if date is available
            const age = dto.manufactured_date
              ? new Date().getFullYear() - dto.manufactured_date.getFullYear()
              : null;

            validVehicles.push({
              ...dto,
              age_of_vehicle: age,
              _rowNumber: row._rowNumber,
            } as Vehicle & { _rowNumber: number });
          }

          this.logger.log(`Validation done. Valid: ${validVehicles.length}, Invalid: ${invalidRows.length}`); //how many invalid and valid rows 

          if (invalidRows.length > 0) {
            this.logger.warn(`Found ${invalidRows.length} invalid rows:`);
            invalidRows.forEach(({ rowNumber, reason, data }) => {
              this.logger.warn(` Row ${rowNumber}: ${data.name} (VIN: ${data.vin}, Email: ${data.email}) - Reason: ${reason}`);
            });
          }

          this.logger.log(`Inserting valid vehicles into database...`);

          let insertedCount = 0;
          const duplicates: Array<{ rowNumber: number; vin: string; name: string }> = [];
          const insertErrors: Array<{ rowNumber: number; vin: string; error: string }> = [];

          // Try to insert each valid vehicle
          for (const vehicle of validVehicles) {
            try {
              // Check if the VIN already exists
              const found = await this.vehicleRepo.findOne({ where: { vin: vehicle.vin } });

              if (found) {
                this.logger.debug(`Duplicate VIN found at row ${vehicle._rowNumber}: ${vehicle.vin}`);
                duplicates.push({
                  rowNumber: vehicle._rowNumber,
                  vin: vehicle.vin,
                  name: `${vehicle.first_name} ${vehicle.last_name}`,
                });
                continue; // Skip insertion for duplicate
              }

              await this.vehicleRepo.save(vehicle);
              insertedCount++;
              this.logger.debug(`Inserted row ${vehicle._rowNumber}: ${vehicle.first_name} ${vehicle.last_name}`);
            } catch (error: any) {
              this.logger.error(`Error inserting row ${vehicle._rowNumber}: ${error.message}`);
              insertErrors.push({
                rowNumber: vehicle._rowNumber,
                vin: vehicle.vin,
                error: error.message || 'Unknown error',
              });
            }
          }

          if (duplicates.length > 0) {
            this.logger.warn(`Skipped ${duplicates.length} duplicates:`);
            duplicates.forEach(({ rowNumber, vin, name }) => {
              this.logger.warn(` Row ${rowNumber}: ${name} (VIN: ${vin})`);
            });
          }

          if (insertErrors.length > 0) {
            this.logger.error(`Failed to insert ${insertErrors.length} rows:`);
            insertErrors.forEach(({ rowNumber, vin, error }) => {
              this.logger.error(` Row ${rowNumber} VIN: ${vin} - Error: ${error}`);
            });
          }

          this.logger.log(`Import finished: Total Rows ${rows.length}, Inserted ${insertedCount}, Invalid ${invalidRows.length}, Duplicates ${duplicates.length}, Errors ${insertErrors.length}`);

          resolve();
        })
        .on('error', (err) => {
          this.logger.error('Error reading CSV file', err);
          reject(err);
        });
    });
  }
}

