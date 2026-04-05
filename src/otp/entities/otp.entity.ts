import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { OtpStatus } from '../enums/otp.status.enum';
import { User } from 'src/user/entities/user.entity';

@Entity('otps')
export class Otp extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  otp: string;

  @Column({ type: 'datetime' })
  expires_at: Date;

  @Column({ type: 'enum', enum: OtpStatus, default: OtpStatus.ACTIVE })
  status: OtpStatus;

  @ManyToOne(() => User, (user) => user.otps, { onDelete: 'CASCADE' })
  user: User;
}
