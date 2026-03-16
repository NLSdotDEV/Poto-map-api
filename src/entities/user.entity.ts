import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Review } from './review.entity';
import { UserRole } from 'src/enum/user_role_enum';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true, unique: true })
  email: string | null;

  @Column({ type: 'varchar', unique: true })
  phone: string;

  @Column({ type: 'varchar' })
  country: string;

  @Column({ type: 'varchar' })
  countryCode: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  getFullPhone() {
    const phone = this.countryCode + this.phone;
    if (phone.startsWith('+')) {
      return phone;
    }

    return '+' + phone;
  }
}
