import { Pool, QueryResult } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
    if (!pool) {
          pool = new Pool({
                  connectionString: process.env.DATABASE_URL,
          });
    }
    return pool;
}

const db = {
    async execute<T>(query: string, params?: any[]): Promise<[T, any]> {
          const result: QueryResult = await getPool().query(query, params);
          return [result.rows as T, result];
    },
};

export default db;
