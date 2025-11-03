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

    const rows: any[] = [];
    let rowIndex = 0;

    return new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          rows.push({ ...row, _rowNumber: rowIndex + 2 }); // +2 for header + 0-index
          rowIndex++;
        })
        .on('end', async () => {
          this.logger.log(`CSV read finished. Total rows to process: ${rows.length}`);

          const validVehicles: Array<Vehicle & { _rowNumber: number }> = [];
          const invalidRows: Array<{ rowNumber: number; reason: string; data: any }> = [];

          this.logger.log('Starting validation of CSV rows');

          // Validate each CSV row
          for (const row of rows) {
            const dto = plainToInstance(CreateVehicleDto, {
              first_name: row.first_name,
              last_name: row.last_name,
              email: row.email,
              car_make: row.car_make,
              car_model: row.car_model,
              vin: row.vin,
              manufactured_date: row.manufactured_date
                ? new Date(row.manufactured_date)
                : null,
            });

            const errors = await validate(dto);
            if (errors.length > 0) {
              const errorMessages = errors
                .map((err) => Object.values(err.constraints || {}).join(', '))
                .join('; ');
              
              invalidRows.push({
                rowNumber: row._rowNumber,
                reason: errorMessages,
                data: {
                  vin: row.vin || 'N/A',
                  email: row.email || 'N/A',
                  name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'N/A',
                },
              });
              continue;
            }

            const age = dto.manufactured_date
              ? new Date().getFullYear() - dto.manufactured_date.getFullYear()
              : null;

            validVehicles.push({
              ...dto,
              age_of_vehicle: age,
              _rowNumber: row._rowNumber,
            } as Vehicle & { _rowNumber: number });
          }

          // Log validation results
          this.logger.log(`Validation complete - Valid: ${validVehicles.length}, Invalid: ${invalidRows.length}`);

          // Log invalid rows
          if (invalidRows.length > 0) {
            this.logger.warn(`VALIDATION ERRORS - Found ${invalidRows.length} invalid rows:`);
            invalidRows.forEach(({ rowNumber, reason, data }) => {
              this.logger.warn(
                ` Row ${rowNumber}: ${data.name} (VIN: ${data.vin}, Email: ${data.email})\n     Reason: ${reason}`,
              );
            });
          }

          this.logger.log(`Starting database insertion for ${validVehicles.length} valid vehicles...`);

          let inserted = 0;
          const duplicateRows: Array<{ rowNumber: number; vin: string; name: string }> = [];
          const errorRows: Array<{ rowNumber: number; vin: string; error: string }> = [];

          // Insert records while detecting duplicates
          for (const vehicle of validVehicles) {
            try {
              // First, check if the VIN already exists
              const existing = await this.vehicleRepo.findOne({
                where: { vin: vehicle.vin }
              });

              if (existing) {
                this.logger.debug(`Duplicate found - Row ${vehicle._rowNumber}: VIN ${vehicle.vin} already exists`);
                duplicateRows.push({
                  rowNumber: vehicle._rowNumber,
                  vin: vehicle.vin,
                  name: `${vehicle.first_name} ${vehicle.last_name}`,
                });
                continue; // Skip to next vehicle
              }

              // If not exists, insert it
              await this.vehicleRepo.save(vehicle);
              inserted++;
              this.logger.debug(`Inserted Row ${vehicle._rowNumber}: ${vehicle.first_name} ${vehicle.last_name} (VIN: ${vehicle.vin})`);
              
            } catch (err: any) {
              this.logger.error(`Failed to insert Row ${vehicle._rowNumber}: ${err.message}`);
              errorRows.push({
                rowNumber: vehicle._rowNumber,
                vin: vehicle.vin,
                error: err.message || 'Unknown error',
              });
            }
          }

          // Log duplicates
          if (duplicateRows.length > 0) {
            this.logger.warn(`DUPLICATES DETECTED Found ${duplicateRows.length} duplicate VINs (already in database)`);
            duplicateRows.forEach(({ rowNumber, vin, name }) => {
              this.logger.warn(` Row ${rowNumber}: ${name} (VIN: ${vin}) - Skipped (already exists)`);
            });
          }

          // Log errors
          if (errorRows.length > 0) {
            this.logger.error(`INSERTION ERRORS - Failed to insert ${errorRows.length} rows:`);
            errorRows.forEach(({ rowNumber, vin, error }) => {
              this.logger.error(`  Row ${rowNumber}: VIN ${vin}\n     Error: ${error}`);
            });
          }

          // Final summary 
          this.logger.log(`Total Rows Processed: ${rows.length}`);
          this.logger.log(`Successfully Inserted: ${inserted}`);
          this.logger.log(`Validation Failed: ${invalidRows.length}`);
          this.logger.log(`Duplicates Skipped: ${duplicateRows.length}`);
          this.logger.log(`Insertion Errors: ${errorRows.length}`);
    

          if (inserted === 0 && duplicateRows.length > 0) {
            this.logger.warn('No new records inserted all VINs already exist in database');
          } else if (inserted > 0) {
            this.logger.log(`Import completed successfully with ${inserted} new vehicles added`);
          }

          resolve();
        })
        .on('error', (err) => {
          this.logger.error('Error reading CSV file', err);
          reject(err);
        });
    });
  }
}