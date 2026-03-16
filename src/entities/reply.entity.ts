import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Review } from './review.entity';

@Entity('replies')
export class Reply extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Review, (review) => review.replies)
  review: Review;

  @ManyToOne(() => Reply, (reply) => reply.children, { nullable: true })
  @JoinColumn({ name: 'parentId' }) // Explicitly naming the FK column
  parent: Reply | null;

  @OneToMany(() => Reply, (reply) => reply.parent)
  children: Reply[];
}
