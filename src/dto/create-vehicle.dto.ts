// import { Field, InputType } from '@nestjs/graphql';

// @InputType()
// export class CreateVehicleDto {
//   @Field()
//   first_name: string;

//   @Field()
//   last_name: string;

//   @Field()
//   email: string;

//   @Field()
//   car_make: string;

//   @Field()
//   car_model: string;

//   @Field()
//   vin: string;

//   @Field()
//   manufactured_date: Date;
// }


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
  @Length(17, 17, { message: 'VIN must be exactly 17 characters' })
  vin: string;
  
 @Field()
 manufactured_date: Date;
}
