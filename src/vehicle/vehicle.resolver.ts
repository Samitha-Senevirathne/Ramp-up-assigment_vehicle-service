import { Resolver, Query, Mutation, Args,ResolveReference } from '@nestjs/graphql';
import { VehicleService } from './vehicle.service';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

@Resolver(() => Vehicle)
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  //List all vehicles with page number
  @Query(() => [Vehicle], { name: 'findAllVehicles' })
  async getAllVehicles(
    @Args('page', { type: () => Number, nullable: true }) page?: number,
  ): Promise<Vehicle[]> {
    return this.vehicleService.findAll(page);
  }

  //Create a new vehicle
  @Mutation(() => Vehicle, { name: 'createVehicle' })
  async createVehicle(@Args('input') input: CreateVehicleDto): Promise<Vehicle> {
    return this.vehicleService.create(input);
  }

  //Update vehicle
  @Mutation(() => Vehicle, { name: 'updateVehicle' })
  async updateVehicle(@Args('input') input: UpdateVehicleDto): Promise<Vehicle> {
    return this.vehicleService.updateVehicle(input);
  }

  //Delete vehicle
  @Mutation(() => Boolean, { name: 'deleteVehicle' })
  async deleteVehicle(@Args('id') id: string): Promise<boolean> {
    return this.vehicleService.deleteVehicle(id);
  }

  //Search vehicles by car model
  @Query(() => [Vehicle], { name: 'searchByModel' })
  async searchVehicles(
    @Args('car_model', { type: () => String }) car_model: string,
  ): Promise<Vehicle[]> {
    return this.vehicleService.searchByModel(car_model);
  }




  
// getvehicleByVIN
@Query(() => Vehicle, { name: 'findVehicleByVIN', nullable: true })
async getVehicleByVIN(
  @Args('vin', { type: () => String }) vin: string,
): Promise<Vehicle | null> {
  return this.vehicleService.findOneByVIN(vin);
}


  @ResolveReference()
  async resolveReference(reference: { vin?: string; id?: string }): Promise<Vehicle | null> {
    if (reference.vin) {
      return this.vehicleService.findOneByVIN(reference.vin);
    }
    if (reference.id) {
      return this.vehicleService.findOneById(reference.id);
    }
    return null;
  }

  //findAll without pagination
  @Query(() => [Vehicle],{name:'findAllVehiclesNoPagination'})
async findAllVehiclesNoPagination(): Promise<Vehicle[]> {
  return this.vehicleService.findAllNoPagination();
}
}
