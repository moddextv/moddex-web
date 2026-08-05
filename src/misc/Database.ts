import 'server-only';

import { logger } from '@/misc/Logger';
import mariadb, { Pool } from 'mariadb';
import { config } from '@/config';

/**
 * the pool is cached on globalThis so hot-reloads in dev reuse it instead of
 * opening a new pool per module evaluation and exhausting max_connections.
 */
const globalForDb = globalThis as unknown as {
  mariadbPool: Pool | undefined;
};

export const db = {
  get pool(): Pool | undefined {
    return globalForDb.mariadbPool;
  },

  createPoolIfNotExists: async function () {
    if (globalForDb.mariadbPool) return;

    globalForDb.mariadbPool = mariadb.createPool({
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.pass,
      charset: 'utf8mb4',
      timezone: 'Z',
      connectionLimit: config.db.connectionLimit,
      acquireTimeout: 10_000,
      connectTimeout: 10_000,
      // SUM()/COUNT() and SERIAL columns arrive as BigInt otherwise, which
      // throws on JSON.stringify in the api routes.
      bigIntAsNumber: true
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
      connection.end();
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
  },

  /**
   * unlike query(), this throws. the healthcheck needs to tell "database is
   * down" apart from "query returned nothing", which query() cannot express.
   */
  ping: async function (): Promise<void> {
    await this.createPoolIfNotExists();
    const connection = await this.pool!.getConnection();

    try {
      await connection.query('SELECT 1');
    } finally {
      connection.end();
    }
  }
};
