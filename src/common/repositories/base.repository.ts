import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
  SaveOptions,
} from 'typeorm';

interface findAllPaginatedQueries {
  page: number;
  per_page: number;
}

interface searchPaginatedQueries {
  page: number;
}

/**
 * @abstract @class BaseRepository
 * @description Standardized data access layer providing generic CRUD, pagination, and search capabilities.
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repo: Repository<T>) {}

  /**
   * @method findAllPaginated
   * @param {findAllPaginatedQueries} queries - page and per_page
   * @param {FindManyOptions<T>} options - standard TypeORM find options
   * @returns {Promise<[T[], number]>} Entities and total count
   * @description Retrieves a paginated subset of the repository.
   */
  async findAllPaginated(
    queries: findAllPaginatedQueries,
    options?: FindManyOptions<T>,
  ) {
    const skip = (queries.page - 1) * queries.per_page;

    return this.repo.findAndCount({
      ...options,
      skip,
      take: queries.per_page,
    });
  }

  /**
   * @method search
   * @param {FindManyOptions<T>} options - filters, relations, etc.
   * @param {searchPaginatedQueries} queries - page number
   * @returns {Promise<[T[], number]>} Filtered entities and total count
   * @description Specialized search method with a hardcoded take limit of 50.
   */
  async search(options: FindManyOptions<T>, queries: searchPaginatedQueries) {
    const take = 50; //take max fifty for all researches
    const skip = (queries.page - 1) * take;

    return this.repo.findAndCount({
      ...options,
      skip,
      take,
    });
  }

  /**
   * @method findOneBy
   * @param {FindOptionsWhere<T> | FindOptionsWhere<T>[]} where - criteria
   * @returns {Promise<T | null>} The found entity or null
   */
  async findOneBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]) {
    return this.repo.findOneBy(where);
  }

  /**
   * @method exists
   * @param {FindManyOptions<T>} options - existence criteria
   * @returns {Promise<boolean>} True if any entity matches the criteria
   */
  async exists(options: FindManyOptions<T>) {
    return this.repo.exists(options);
  }

  /**
   * @method create
   * @param {DeepPartial<T>} data - Information for the new entity
   * @returns {T} Fresh entity instance (not saved)
   */
  create(data: DeepPartial<T>) {
    return this.repo.create(data);
  }

  /**
   * @method batchCreate
   * @param {DeepPartial<T>[]} data - Array of entity data
   * @returns {Promise<T[]>} The saved entity instances
   */
  async batchCreate(data: DeepPartial<T>[]) {
    const entities = data.map((value) => this.repo.create(value));
    return this.repo.save(entities as any);
  }

  /**
   * @method save
   * @param {T | T[]} entity - Record(s) to persist
   * @param {SaveOptions} options - TypeORM save options
   * @returns {Promise<T>} The saved record
   */
  async save(entity: T | T[], options?: SaveOptions): Promise<T> {
    return this.repo.save(entity as any, options);
  }

  /**
   * @method update
   * @param {FindOptionsWhere<T>} options - Selection criteria
   * @param {DeepPartial<T>} partialEntity - Data to merge
   * @returns {Promise<T | null>} The updated entity or null
   * @description Enterprise-grade update: fetches, merges, and saves to trigger lifecycle hooks.
   */
  async update(
    options: FindOptionsWhere<T>,
    partialEntity: DeepPartial<T>,
  ): Promise<T | null> {
    const entity = await this.repo.findOneBy(options);
    if (!entity) return null;

    this.repo.merge(entity, partialEntity);
    return this.repo.save(entity as any);
  }

  /**
   * @method batchUpdate
   * @param {DeepPartial<T>[]} data - Array of entities to update
   * @returns {Promise<T[]>} The updated records
   * @description Batch saves entities, correctly triggering lifecycle hooks for each.
   */
  async batchUpdate(data: DeepPartial<T>[]): Promise<T[]> {
    return this.repo.save(data as any);
  }

  /**
   * @method delete
   * @param {FindOptionsWhere<T> | FindOptionsWhere<T>[]} options - criteria
   * @description Remove records from the database.
   */
  async delete(options: FindOptionsWhere<T> | FindOptionsWhere<T>[]) {
    return this.repo.delete(options);
  }

  /**
   * @method queryBuilder
   * @param {string} alias - optional alias for the main table
   * @returns {SelectQueryBuilder<T>} Custom query builder for advanced operations
   */
  queryBuilder(alias?: string) {
    return this.repo.createQueryBuilder(alias);
  }
}
