// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ILike, Repository } from 'typeorm';
// import { Vehicle } from '../entities/vehicle.entity';
// import { CreateVehicleDto } from '../dto/create-vehicle.dto';
// import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

// @Injectable()
// export class VehicleService {
//   constructor(
//     @InjectRepository(Vehicle)
//     private vehicleRepo: Repository<Vehicle>,
//   ) {}

//   async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
//     const age =
//       new Date().getFullYear() -
//       new Date(createVehicleDto.manufactured_date).getFullYear();
//     const vehicle = this.vehicleRepo.create({ ...createVehicleDto, age_of_vehicle: age });
//     return this.vehicleRepo.save(vehicle);
//   }

//   async findAll(): Promise<Vehicle[]> {
//     return this.vehicleRepo.find();
//   }

//   async updateVehicle(updateDto: UpdateVehicleDto): Promise<Vehicle> {
//     await this.vehicleRepo.update(updateDto.id, updateDto);
//     const vehicle = await this.vehicleRepo.findOneBy({ id: updateDto.id });
//     if (!vehicle) {
//       throw new Error('Vehicle not found');
//     }
//     return vehicle;
//   }

//   async deleteVehicle(id: string): Promise<boolean> {
//     const result = await this.vehicleRepo.delete(id);
//     return (result.affected ?? 0) > 0;
//   }


//  async searchByModel(car_model: string): Promise<Vehicle[]> {
//     // Convert GraphQL-style * to SQL wildcard %
//     let search = car_model.replace(/\*/g, '%');

//     // If user did not provide *, match anywhere by default
//     if (!search.includes('%')) {
//       search = `%${search}%`;
//     }

//     return this.vehicleRepo.find({
//       where: { car_model: ILike(search) },
//     });
//   }
          
// }


import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
  ) {}

  // // Create a new vehicle
  // async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
  //   // Calculate age of vehicle based on manufactured_date
  //   let age = null;
  //   if (createVehicleDto.manufactured_date) {
  //     age = new Date().getFullYear() - new Date(createVehicleDto.manufactured_date).getFullYear();
  //   }

  //   const vehicle = this.vehicleRepo.create({ ...createVehicleDto, age_of_vehicle: age });
  //   return this.vehicleRepo.save(vehicle);
  // }


    async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const age =
      new Date().getFullYear() -
      new Date(createVehicleDto.manufactured_date).getFullYear();
    const vehicle = this.vehicleRepo.create({ ...createVehicleDto, age_of_vehicle: age });
    return this.vehicleRepo.save(vehicle);
  }

  // Find all vehicles with pagination and sorted by manufactured_date ASC
  async findAll(page = 1, limit = 100): Promise<Vehicle[]> {
    const skip = (page - 1) * limit;

    return this.vehicleRepo.find({
      order: { manufactured_date: 'ASC' }, // sort by manufactured_date ascending
      take: limit,
      skip,
    });
  }

  // Update vehicle info
  async updateVehicle(updateDto: UpdateVehicleDto): Promise<Vehicle> {
    // If manufactured_date is updated, recalculate age
    if (updateDto.manufactured_date) {
      updateDto['age_of_vehicle'] =
        new Date().getFullYear() - new Date(updateDto.manufactured_date).getFullYear();
    }

    await this.vehicleRepo.update(updateDto.id, updateDto);
    const vehicle = await this.vehicleRepo.findOneBy({ id: updateDto.id });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    return vehicle;
  }

  // Delete vehicle
  async deleteVehicle(id: string): Promise<boolean> {
    const result = await this.vehicleRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  // Search by car_model with wildcard support
  async searchByModel(car_model: string): Promise<Vehicle[]> {
    let search = car_model.replace(/\*/g, '%');
    if (!search.includes('%')) {
      search = `%${search}%`;
    }

    return this.vehicleRepo.find({
      where: { car_model: ILike(search) },
      order: { manufactured_date: 'ASC' },
    });
  }
}
