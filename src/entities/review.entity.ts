import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Reply } from './reply.entity';
import { Business } from './business.entity';

@Entity('review')
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float' })
  note: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  //   relations
  @ManyToOne(() => User, (user) => user.reviews)
  user: User;

  @ManyToOne(() => Business, (business) => business.reviews)
  business: Business;

  @OneToMany(() => Reply, (reply) => reply.review, { nullable: true })
  replies: Reply[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
