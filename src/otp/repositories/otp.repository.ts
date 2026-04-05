import { BaseRepository } from 'src/common/repositories/base.repository';
import { Otp } from '../entities/otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { OtpStatus } from '../enums/otp.status.enum';
import { randomInt } from 'crypto';
import { BadRequestException } from '@nestjs/common';

export class OtpRepository extends BaseRepository<Otp> {
  constructor(
    @InjectRepository(Otp)
    protected repo: Repository<Otp>,
  ) {
    super(repo);
  }

  /**
   * @method getValidOtp
   * @description Check if the user passed has valid otp saved and return it instead of generating another one
   * @param userId
   */
  async getValidOtp(userId: string) {
    const currentDate = new Date();
    const maxDate = new Date(currentDate);
    maxDate.setMinutes(currentDate.getMinutes() - 1);

    return this.repo.findOneBy({
      user: { id: userId },
      status: OtpStatus.ACTIVE,
      expires_at: MoreThan(maxDate),
    });
  }

  async isOtpValid(otp: string) {
    return await this.repo.findOneBy({
      otp,
    });
  }

  async validateOtp(otp: string) {
    const foundOtp = await this.repo.findOne({
      where: {
        otp,
        status: OtpStatus.ACTIVE,
        expires_at: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!foundOtp) {
      return null;
    }

    foundOtp.expires_at = new Date();
    foundOtp.status = OtpStatus.EXPIRED;
    await this.save(foundOtp);
    return foundOtp.user;
  }
}
