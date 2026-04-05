import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { QueryDto } from 'src/common/dto/query.dto';
import { paginate } from 'src/common/lib/paginator';
import { CreateUser } from '../interfaces/create_user.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../entities/user.entity';
import { DeepPartial, FindOptionsWhere } from 'typeorm';

/**
 * @class UserService
 * Handles business logic for user management, including creation, retrieval, and verification.
 */
@Injectable()
export class UserService {
  constructor(
    private repo: UserRepository,
    private eventEmmitter: EventEmitter2,
  ) {}

  /**
   * @method getAllUser
   * @param {QueryDto} queries - Pagination and filtering options
   * @returns {Promise<any>} Paginated list of users
   * @description Retrieves a paginated list of all users.
   */
  async getAllUser(queries: QueryDto) {
    const [users, total] = await this.repo.findAllPaginated({
      page: queries.page,
      per_page: queries.per_page,
    });

    return paginate(queries.per_page, queries.page, total, users);
  }

  /**
   * @method getUserByPhone
   * @param {string} phone_number - The user's phone number
   * @returns {Promise<User>} The found user
   * @throws {NotFoundException} If the user does not exist
   * @description Find a single user by their phone number.
   */
  async getUserByPhone(phone_number: string) {
    const user = await this.repo.findOneBy({
      phone_number,
    });

    if (!user) {
      throw new NotFoundException('phone number not found');
    }

    return user;
  }

  /**
   * @method findOneBy
   * @param {FindOptionsWhere<User>} where - Search criteria
   * @returns {Promise<User | null>} The found user or null
   * @description Generic find method for specific criteria.
   */
  async findOneBy(where: FindOptionsWhere<User>) {
    return this.repo.findOneBy(where);
  }

  /**
   * @method createUser
   * @param {CreateUser} data - New user information
   * @returns {Promise<User>} The newly created user
   * @throws {BadRequestException} If the phone number is already taken
   * @description Validates and persists a new user to the database.
   */
  async createUser(data: CreateUser) {
    const exists = await this.repo.findOneBy({
      phone_number: data.phone_number,
    });

    if (exists) {
      throw new BadRequestException('cannot use this phone number');
    }

    const user = this.repo.create({
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
      role: data.role,
    });

    await this.repo.save(user);
    this.eventEmmitter.emit('user:create', user);
    return user;
  }

  /**
   * @method updateUser
   * @param {string} id - The user ID
   * @param {DeepPartial<User>} data - The fields to update
   * @returns {Promise<User>} The updated user
   * @throws {NotFoundException} If the user does not exist
   * @description Finds, merges, and saves user updates.
   */
  async updateUser(id: string, data: DeepPartial<User>) {
    const user = await this.repo.update({ id }, data);
    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  /**
   * @method clearRefreshToken
   * @param {User} user - The user to logout
   * @description Revokes the session by clearing the refresh token.
   */
  async clearRefreshToken(user: User) {
    await this.repo.clearRefreshToken(user);
  }

  /**
   * @method findWithRefreshToken
   * @param {string} id - The user ID
   * @returns {Promise<User | null>} The user with refresh_token field selected
   * @description Specialized find method for authentication checks on hidden fields.
   */
  async findWithRefreshToken(id: string) {
    return this.repo
      .queryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect('user.refresh_token')
      .getOne();
  }

  /**
   * @method deleteUser
   * @param {string} id - The user ID to delete
   * @description Permanently removes a user from the system.
   */
  async deleteUser(id: string) {
    return await this.repo.delete({
      id,
    });
  }
}
