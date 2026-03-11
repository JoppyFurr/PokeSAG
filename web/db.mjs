const DB_TYPE = process.env.DB_TYPE || 'sqlite';
const { db } = await import(DB_TYPE === 'postgres' ? './db_postgres.mjs' : './db_sqlite.mjs');
export { db };
