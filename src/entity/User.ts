import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Tenant } from "./Tenant";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  role: string;

  @ManyToOne(() => Tenant, {
    nullable: true,
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  tenant: Tenant;

  @UpdateDateColumn()
  updated_at: number;

  @CreateDateColumn()
  created_at: number;
}
