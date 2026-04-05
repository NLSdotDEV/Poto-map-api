import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../enums/user.role.enum';
import { Otp } from 'src/otp/entities/otp.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  first_name: string | null;

  @Column()
  last_name: string;

  @Column({ unique: true })
  phone_number: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ nullable: true, type: 'varchar', select: false })
  refresh_token: string | null;

  @Column({ type: 'bool', default: false })
  is_verified: boolean;

  @Column({ type: 'datetime', select: false })
  verified_at: Date;

  @OneToMany(() => Otp, (otp) => otp.user)
  otps: Otp[];

  // TODO: implement reviews and activies added and build the relation

  @BeforeInsert()
  @BeforeUpdate()
  async hashRefreshToken() {
    if (this.refresh_token && !this.refresh_token.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      const hashedToken = await bcrypt.hash(this.refresh_token, salt);
      this.refresh_token = hashedToken;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  verifyUser() {
    if (this.is_verified) {
      this.verified_at = new Date();
    }
  }
}
