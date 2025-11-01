import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsDateString, Length } from 'class-validator';

@InputType()
export class CreateVehicleDto {
  @Field()
  @IsNotEmpty()
  first_name: string;

  @Field()
  @IsNotEmpty()
  last_name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  car_make: string;

  @Field()
  @IsNotEmpty()
  car_model: string;

  @Field()
  @IsNotEmpty()
  vin: string;
  
 @Field()
 manufactured_date: Date;
}
