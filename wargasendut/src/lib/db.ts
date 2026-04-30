import { Pool, QueryResult } from 'pg';

const globalForDb = globalThis as unknown as {
  db: Pool | undefined;
};

const pool =
  globalForDb.db ??
  new Pool({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://postgres@localhost:5432/wargasendut',
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
