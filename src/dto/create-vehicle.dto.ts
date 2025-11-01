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
  @Length(5, 5, { message: 'VIN must be exactly 5 characters' })
  vin: string;
  
 @Field()
 manufactured_date: Date;
}
