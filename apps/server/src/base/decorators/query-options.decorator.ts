import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import {
  In,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';
import { CursorQueryOptionsDto, Filter, QueryOptionsDto } from '../dtos/query-options.dto';
import { QueryOperator } from '../enums';
interface Options {
  keepRawFilters?: boolean;
  acceptFilterFields?: Array<
    | string
    | {
      name: string;
      type?:
      | StringConstructor
      | NumberConstructor
      | BooleanConstructor
      | DateConstructor
      | ArrayConstructor;
    }
  >;
}
export class QueryOptionsHelper {
  sort: Record<string, 'desc' | 'asc'>;
  search: string;
  take: number;
  skip: number;
  filters: Record<string, unknown>;
  limit: number = 10;
  page: number = 1;

  constructor(
    partial: QueryOptionsDto,
    options: Options = {
      keepRawFilters: false,
      acceptFilterFields: []
    },
  ) {
    this.sort = partial.sort || {};
    this.take = partial.limit || 10;
    this.skip = partial.page > 0 ? (partial.page - 1) * this.take : 0;
    this.search = partial.search || '';
    this.filters = this.mapFindOptions(
      partial.filters,
      options.keepRawFilters,
      options.acceptFilterFields,
    );
    if (partial.page) this.page = partial.page;
    if (partial.limit) this.limit = partial.limit;
  }

  getPagination = ({ count, total }: { count: number; total: number }) => {
    const totalPage = Math.ceil(count / this.take);
    const pageSize = this.limit;
    const currentPage = this.page;
    return { totalPage, total, pageSize, currentPage };
  };

  private mapFindOptions = (
    filters: QueryOptionsDto['filters'],
    keepRawFilters = false,
    acceptFields: Array<
      | string
      | {
        name: string;
        type?:
        | StringConstructor
        | NumberConstructor
        | BooleanConstructor
        | DateConstructor
        | ArrayConstructor;
      }
    > = [],
  ): Record<string, unknown> => {
    if (keepRawFilters) {
      return filters
    }

    const filterObject = {};
    const fieldConfigs = acceptFields.map((field) =>
      typeof field === 'string' ? { name: field, type: String } : field,
    );

    for (const field in filters) {
      const filter = filters[field];
      const key = Object.keys(filter)?.[0] as keyof typeof filter;

      // Check if field is accepted
      const fieldConfig = fieldConfigs.find((config) => config.name === field);
      if (!fieldConfig) continue;

      // Convert the value to the appropriate type
      let value = filter[key];
      if (key !== QueryOperator.IN && key !== QueryOperator.NOT_IN) {
        switch (fieldConfig.type) {
          case Number:
            if (isNaN(value as number)) continue;
            value = Number(value);
            break;
          case Boolean:
            value = value === 'true' || value === true;
            break;
          case Date:
            if (isNaN((value as Date).getTime())) continue;
            value = new Date(value as string);
            break;
          case String:
            value = String(value);
            break;

          default:
            break;
        }
      } else {
        if (!Array.isArray(value)) {
          value = [value];
        }
        value = (value as unknown[]).map((v: string | number) => v);
      }

      switch (key) {
        case QueryOperator.EQUAL:
          filterObject[field] = value;
          break;
        case QueryOperator.NOT_EQUAL:
          filterObject[field] = { $ne: value };
          break;
        case QueryOperator.GREATER_THAN:
          filterObject[field] = { $gt: value };
          break;
        case QueryOperator.GREATER_THAN_OR_EQUAL:
          filterObject[field] = { $gte: value };
          break;
        case QueryOperator.LESS_THAN:
          filterObject[field] = { $lt: value };
          break;
        case QueryOperator.LESS_THAN_OR_EQUAL:
          filterObject[field] = { $lte: value };
          break;
        case QueryOperator.IN:
          filterObject[field] = { In: value };
          break;
        case QueryOperator.NOT_IN:
          filterObject[field] = { $nin: value };
          break;

        default:
          break;
      }
    }
    return filterObject;
  };
}
export interface CursorResult<T> {
  data: T[];
  pagination: {
    limit: number;
    nextCursor?: string;
    hasNextPage: boolean;
  };
}

export interface CursorPaginationOptions extends Options {
  cursorField?: 'id' | 'createdAt';
  direction?: 'DESC' | 'ASC';
}

export class CursorQueryOptionsHelper {
  limit: number = 10;
  nextCursor?: string;
  filters: Record<string, unknown>;
  search: string;
  options: CursorPaginationOptions;

  constructor(
    partial: CursorQueryOptionsDto,
    options: CursorPaginationOptions = {
      cursorField: 'id',
      direction: 'DESC',
      acceptFilterFields: []
    },
  ) {
    this.options = options;
    this.limit = partial.limit || this.limit;
    this.nextCursor = partial.nextCursor;
    this.filters = this.mapFindOptions(
      partial.filters,
      options.keepRawFilters,
      options.acceptFilterFields,
    );
    if (partial.search !== undefined) {
      this.search = partial.search;
    }
  }

  private mapFindOptions = (
    filters: QueryOptionsDto['filters'],
    keepRawFilters = false,
    acceptFields: Array<
      | string
      | {
        name: string;
        type?:
        | StringConstructor
        | NumberConstructor
        | BooleanConstructor
        | DateConstructor
        | ArrayConstructor;
      }
    > = [],
  ): Record<string, unknown> => {
    if (keepRawFilters) {
      return filters;
    }

    const filterObject = {};
    const fieldConfigs = acceptFields.map((field) =>
      typeof field === 'string' ? { name: field, type: String } : field,
    );

    for (const field in filters) {
      const filter = filters[field];
      const key = Object.keys(filter)?.[0] as keyof typeof filter;

      const fieldConfig = fieldConfigs.find((config) => config.name === field);
      if (!fieldConfig) continue;

      let value = filter[key];
      if (key !== QueryOperator.IN && key !== QueryOperator.NOT_IN) {
        switch (fieldConfig.type) {
          case Number:
            if (isNaN(value as number)) continue;
            value = Number(value);
            break;
          case Boolean:
            value = value === 'true' || value === true;
            break;
          case Date:
            if (isNaN((value as Date).getTime())) continue;
            value = new Date(value as string);
            break;
          case String:
            value = String(value);
            break;
          default:
            break;
        }
      } else {
        if (!Array.isArray(value)) {
          value = [value];
        }
        value = (value as unknown[]).map((v: string | number) => v);
      }

      switch (key) {
        case QueryOperator.EQUAL:
          filterObject[field] = value;
          break;
        case QueryOperator.NOT_EQUAL:
          filterObject[field] = Not(value);
          break;
        case QueryOperator.GREATER_THAN:
          filterObject[field] = MoreThan(value);
          break;
        case QueryOperator.GREATER_THAN_OR_EQUAL:
          filterObject[field] = MoreThanOrEqual(value);
          break;
        case QueryOperator.LESS_THAN:
          filterObject[field] = LessThan(value);
          break;
        case QueryOperator.LESS_THAN_OR_EQUAL:
          filterObject[field] = LessThanOrEqual(value);
          break;
        case QueryOperator.IN:
          filterObject[field] = In(value as unknown[]);
          break;
        case QueryOperator.NOT_IN:
          filterObject[field] = Not(In(value as unknown[]));
          break;
        default:
          break;
      }
    }
    return filterObject;
  };

  /**
   * Build where conditions for cursor pagination.
   * Uses the cursor to filter records after the last seen cursor value.
   */
  buildWhereConditions = (): Record<string, unknown> => {
    const whereConditions: Record<string, unknown> = { ...this.filters };

    if (this.nextCursor) {
      const cursorData = this.decodeCursor(this.nextCursor);
      if (cursorData) {
        whereConditions[this.options.cursorField] = this.options.direction === 'DESC' 
        ? LessThan(cursorData[this.options.cursorField]) 
        : MoreThanOrEqual(cursorData[this.options.cursorField]);
      }
    }

    return whereConditions;
  };

  getCursorLimit = () => {
    return this.limit + 1;
  };
  
  getCursorOrder = () => {
    return {
      [this.options.cursorField]: this.options.direction === 'DESC' ? 'DESC' : 'ASC',
    };
  };

  /**
   * Encode cursor data to base64 JSON string.
   */
  encodeCursor = (data: { id: string; createdAt: Date }): string => {
    const cursorObject = {
      id: data.id,
      createdAt: data.createdAt.toISOString(),
    };
    return Buffer.from(JSON.stringify(cursorObject)).toString('base64');
  };

  /**
   * Decode a cursor JSON string to object.
   */
  decodeCursor = (cursor: string): { id: string; createdAt: string } | null => {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  };

  getCursorPagination = <T extends { id: string; createdAt: Date }>(
    items: T[],
  ): {
    items: T[];
    pagination: {
      limit: number;
      nextCursor?: string;
      hasNextPage: boolean;
    };
    } => {
    if (items.length <= this.limit) {
      return { items, pagination: { limit: this.limit, nextCursor: undefined, hasNextPage: false } };
    }

    const resultItems = items.slice(0, this.limit);
    const lastItem = resultItems[resultItems.length - 1];
    const nextCursor = this.encodeCursor({
      id: lastItem.id,
      createdAt: lastItem.createdAt,
    });

    return { items: resultItems, pagination: { limit: this.limit, nextCursor, hasNextPage: true } };
  };
}

export const QueryOptions = createParamDecorator(
  async (
    _options: Options = { acceptFilterFields: [] },
    ctx: ExecutionContext,
  ) => {
    void _options;
    const req: Request = ctx.switchToHttp().getRequest();
    const rawQuery = req.query;
    const page = parseInt(rawQuery.page as string) || 1;
    const limit = parseInt(rawQuery.limit as string) || 20;
    const search = (rawQuery.search as string) || '';

    const sort: Record<string, 'desc' | 'asc'> = {};
    Object.keys(rawQuery).forEach((key) => {
      const sortMatch = key.match(/^sort\[(.+)\]$/);
      if (sortMatch) {
        const field = sortMatch[1];
        const value = rawQuery[key] as string;
        if (value === 'desc' || value === 'asc') {
          sort[field] = value;
        }
      }
    });

    const filters: Record<string, Record<string, unknown>> = {};
    Object.keys(rawQuery).forEach((key) => {
      const filterMatch = key.match(/^filters\[(.+)\]\[(.+)\]$/);
      if (filterMatch) {
        const field = filterMatch[1];
        const operator = filterMatch[2];
        const value = rawQuery[key];
        if (!filters[field]) {
          filters[field] = {};
        }
        filters[field][operator] = value;
      }
    });
    const queryOptionsDto: QueryOptionsDto = {
      page,
      limit,
      search,
      sort,
      filters: filters as Record<string, Filter>,
    };
    return queryOptionsDto;
  },
);
