import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Vehicle {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  first_name: string;

  @Field()
  @Column()
  last_name: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  car_make: string;

  @Field()
  @Column()
  car_model: string;

  @Field()
  @Column()
  vin: string;

  @Field({nullable:true})
  @Column({nullable:true})
  manufactured_date: Date;

  @Field()
  @Column({nullable:true})
  age_of_vehicle: number;
}
