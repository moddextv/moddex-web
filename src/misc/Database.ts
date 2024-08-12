import { logger } from '@/misc/Logger';
import mariadb from 'mariadb';
import { config } from '@/config';

export const db = {
  pool: null as any,

  createPoolIfNotExists: async function () {
    if (this.pool !== null) return;

    this.pool = mariadb.createPool({
      host: config.db.host,
      database: config.db.name,
      user: config.db.user,
      password: config.db.pass,
      charset: 'utf8mb4',
      timezone: 'Z',
      connectionLimit: 100
    });
  },

  query: async function (queryParam: string, params: any[] = []) {
    await this.createPoolIfNotExists();
    const connection = await this.pool!.getConnection();

    let result;
    try {
      result = await connection.query(queryParam, params);
    } catch (e) {
      logger.error(e);
    } finally {
      connection.release();
    }

    return result || [];
  },

  queryOne: async function (
    queryStr: string,
    params: any[] = [],
    addLimit = true
  ) {
    const result = await this.query(
      `${queryStr}${addLimit ? ' LIMIT 1' : ''}`,
      params
    );
    return result?.[0] || false;
  },

  entryExists: async function (
    queryStr: string,
    params: any[] = [],
    addLimit = true
  ) {
    const rows = await this.query(
      `${queryStr}${addLimit ? ' LIMIT 1' : ''}`,
      params
    );
    return rows.length > 0;
  }
};
