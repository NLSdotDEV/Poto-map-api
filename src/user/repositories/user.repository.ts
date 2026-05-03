import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { Injectable } from '@nestjs/common';

/**
 * @class UserRepository
 * Data access layer for User entities.
 */
@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    protected repo: Repository<User>,
  ) {
    super(repo);
  }

  /**
   * @method clearRefreshToken
   * @param {string} userId - The id of the user whose session is being revoked
   * @description Clears the persistent refresh token to effectively log out the user across devices.
   */
  async clearRefreshToken(userId: string) {
    if (!(await this.exists({ where: { id: userId } }))) {
      return null;
    }
    await this.update(
      { id: userId },
      {
        refresh_token: null,
      },
    );
  }
}
