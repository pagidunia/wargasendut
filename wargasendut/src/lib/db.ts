import { Pool, QueryResult } from 'pg';

const globalForDb = globalThis as unknown as {
  db: Pool | undefined;
};

const pool =
  globalForDb.db ??
  new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'wargasendut',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = pool;
}

const db = {
  async execute<T>(query: string, params?: any[]): Promise<[T, any]> {
    const result: QueryResult = await pool.query(query, params);
    return [result.rows as T, result];
  },
};

export default db;
