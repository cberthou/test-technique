/**
 * STUB of the `mysql2/promise` module.
 *
 * Provides just enough of the real API shape (createConnection -> execute)
 * for the deliberately-bad OrderService to type-check and run without a
 * real database. Queries are recorded in memory instead of executed.
 *
 * ⚠️ This stub exists so the repo has zero third-party dependencies.
 * The DIP violation being demonstrated is the *direct import of a concrete
 * driver* here, not the stub itself.
 */

export interface FieldPacket {
  name: string;
}

export interface ResultSetHeader {
  insertId: number;
  affectedRows: number;
}

export type QueryResult = ResultSetHeader | unknown[];

export interface Connection {
  execute(sql: string, params?: unknown[]): Promise<[QueryResult, FieldPacket[]]>;
}

export interface ConnectionOptions {
  host: string;
  user: string;
  password: string;
  database: string;
}

const executedQueries: Array<{ sql: string; params?: unknown[] }> = [];
let nextInsertId = 1;

export function createConnection(_opts: ConnectionOptions): Connection {
  return {
    async execute(sql: string, params?: unknown[]) {
      executedQueries.push({ sql, params });

      if (sql.startsWith("INSERT INTO orders")) {
        const header: ResultSetHeader = { insertId: nextInsertId++, affectedRows: 1 };
        return [header, []];
      }
      // UPDATE / other INSERTs: assume success, no result rows.
      return [{ affectedRows: 1 } as ResultSetHeader, []];
    },
  };
}

/** Test helper: inspect what the god class "wrote to the DB". */
export function __getExecutedQueries() {
  return [...executedQueries];
}

/** Test helper: reset the in-memory query log. */
export function __reset() {
  executedQueries.length = 0;
  nextInsertId = 1;
}
