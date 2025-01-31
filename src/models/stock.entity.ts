import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./user.entity";

@Entity("stocks")
export class Stock {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.stocks)
  user: User;

  @Column({ type: "decimal", default: 0 })
  totalOrdersAndPurchases: number;

  @Column({ type: "decimal", default: 0 })
  totalAmountSpent: number;
}
