
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
  private logger = new Logger('VehicleService');

  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
  ) {}

  // Create a new vehicle
  async create(createDto: CreateVehicleDto): Promise<Vehicle> {
    try {
      const age =
        new Date().getFullYear() -
        new Date(createDto.manufactured_date).getFullYear();

      const vehicle = this.vehicleRepo.create({
        ...createDto,
        age_of_vehicle: age,
      });

      const savedVehicle = await this.vehicleRepo.save(vehicle);
      this.logger.log(`Vehicle created: ${savedVehicle.id}`);
      return savedVehicle;
    } catch (error) {
      this.logger.error(`Error creating vehicle: ${error.message}`);
      throw error;
    }
  }

  // Find all vehicles (with pagination)
  async findAll(page = 1, limit = 100): Promise<Vehicle[]> {
    try {
      const skip = (page - 1) * limit;
      const vehicles = await this.vehicleRepo.find({
        order: { manufactured_date: 'ASC' },
        take: limit,    //how many records to fetch
        skip,
      });
      this.logger.log(`Fetched ${vehicles.length} vehicles`);
      return vehicles;
    } catch (error) {
      this.logger.error(`Error fetching vehicles: ${error.message}`);
      throw error;
    }
  }

  // Update vehicle info
  async updateVehicle(updateDto: UpdateVehicleDto): Promise<Vehicle> {
    try {
      if (updateDto.manufactured_date) {
        updateDto['age_of_vehicle'] =
          new Date().getFullYear() -
          new Date(updateDto.manufactured_date).getFullYear();
      }

      await this.vehicleRepo.update(updateDto.id, updateDto);
      const vehicle = await this.vehicleRepo.findOneBy({ id: updateDto.id });

      if (!vehicle) {
        this.logger.warn(`Vehicle not found: ${updateDto.id}`);
        throw new Error('Vehicle not found');
      }

      this.logger.log(`Vehicle updated: ${updateDto.id}`);
      return vehicle;
    } catch (error) {
      this.logger.error(`Error updating vehicle: ${error.message}`);
      throw error;
    }
  }

  // Delete vehicle
  async deleteVehicle(id: string): Promise<boolean> {
    try {
      const result = await this.vehicleRepo.delete(id);
      if (result.affected && result.affected > 0) {
        this.logger.log(`Vehicle deleted: ${id}`);
        return true;
      } else {
        this.logger.warn(`Vehicle not found for deletion: ${id}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error deleting vehicle: ${error.message}`);
      throw error;
    }
  }


//search by model
  async searchByModel(car_model: string): Promise<Vehicle[]> {
  try {
    const vehicles = await this.vehicleRepo.find({
      where: { car_model: ILike(`%${car_model}%`) },
      order: { manufactured_date: 'ASC' },
    });

    this.logger.debug(`Found ${vehicles.length} vehicles matching: ${car_model}`);
    return vehicles;
  } catch (error) {
    this.logger.error(`Failed to search vehicles: ${error.message}`);
    throw error;
  }
}

  // Find one vehicle by VIN
  async findOneByVIN(vin: string): Promise<Vehicle | null> {
    try {
      const vehicle = await this.vehicleRepo.findOne({ where: { vin } });
      if (!vehicle) {
        this.logger.warn(`No vehicle found with VIN: ${vin}`);
      }
      return vehicle;
    } catch (error) {
      this.logger.error(`Error finding vehicle by VIN: ${error.message}`);
      throw error;
    }
  }

  // Find one vehicle by ID
  async findOneById(id: string): Promise<Vehicle | null> {
    try {
      const vehicle = await this.vehicleRepo.findOneBy({ id });
      if (!vehicle) {
        this.logger.warn(`No vehicle found with ID: ${id}`);
      }
      return vehicle;
    } catch (error) {
      this.logger.error(`Error finding vehicle by ID: ${error.message}`);
      throw error;
    }
  }

  // Find all vehicles without pagination
async findAllNoPagination(): Promise<Vehicle[]> {
  try {
    const vehicles = await this.vehicleRepo.find({
      order: { manufactured_date: 'ASC' },
    });
    this.logger.log(`Fetched ${vehicles.length} vehicles`);
    return vehicles;
  } catch (error) {
    this.logger.error(`Error fetching vehicles: ${error.message}`);
    throw error;
  }
}
}
