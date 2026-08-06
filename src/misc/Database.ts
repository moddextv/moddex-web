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

  /**
   * throws on failure. it used to log and return [], which made "the database
   * is unreachable" and "there are no rows" the same value to every caller --
   * an outage rendered as an empty channel list and a homepage of zeroes
   * rather than an error. callers that genuinely want the lenient behaviour
   * should catch and say so at the call site.
   */
  query: async function (queryParam: string, params: any[] = []) {
    await this.createPoolIfNotExists();
    const connection = await this.pool!.getConnection();

    try {
      return await connection.query(queryParam, params);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      connection.end();
    }
  },

  /**
   * `false` now means "no such row" and nothing else -- a failed query throws
   * rather than arriving here as an empty result set.
   */
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
