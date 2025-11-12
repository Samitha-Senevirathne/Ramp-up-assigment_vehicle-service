import { Directive, Field, ID, ObjectType, } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn ,Unique} from 'typeorm';
import { IsEmail, IsNotEmpty, IsOptional, IsDateString, Length } from 'class-validator';

@ObjectType()
@Directive('@key(fields: "vin")')
@Entity()
@Unique(['vin'])
export class Vehicle {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id: string;

  @Field()
  @Column()
   @IsNotEmpty()
  first_name: string;

  @Field()
  @Column()
   @IsNotEmpty()
  last_name: string;

  @Field()
  @Column()
   @IsEmail()
  email: string;

  @Field()
  @Column()
   @IsNotEmpty()
  car_make: string;

  @Field()
  @Column()
   @IsNotEmpty()
  car_model: string;

  @Field()
   @IsNotEmpty()
  @Column({unique:true})
  
  vin: string;

  @Field({ nullable: false })
  @Column({ nullable: false })
  manufactured_date: Date;

  @Field({ nullable: false})
  @Column({ nullable: false })
  age_of_vehicle: number;
}
