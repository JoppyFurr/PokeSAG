import pgPromise from 'pg-promise';
import { DateTime } from 'luxon';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_NAME = process.env.DB_NAME || 'pokesag';
const DB_USER = process.env.DB_USER || 'pokesag';
const DB_PASS = process.env.DB_PASS || 'pokesag';
const DB_PORT = process.env.DB_PORT || 5432;

class PagesRepository {
    constructor(rep, pgp) {
        this.rep = rep;
        this.pgp = pgp;
    }

    latest(offset=0) {
        return this.rep.any(`SELECT id, rx_date, source, recipient, content FROM pages
        ORDER BY rx_date DESC, recipient ASC LIMIT 100 OFFSET $1::int`, [offset]);
    }

    search(query, offset=0) {
        return this.rep.any(`SELECT id, rx_date, source, recipient, content FROM pages WHERE tsx @@ websearch_to_tsquery('simple', $2::text)
        ORDER BY rx_date DESC, recipient ASC LIMIT 100 OFFSET $1::int`, [offset, query]);
    }

    searchBasic(query, offset=0) {
        return this.rep.any(`SELECT id, rx_date, source, recipient, content FROM pages WHERE content ILIKE $2::text OR recipient=$3::text OR source=$3::text
        ORDER BY rx_date DESC, recipient ASC LIMIT 100 OFFSET $1::int`, [offset, `%${query}%`, query]);
    }

    searchSource(query, offset=0) {
        return this.rep.any(`SELECT id, rx_date, source, recipient, content FROM pages WHERE source ILIKE $2::text
        ORDER BY rx_date DESC, recipient ASC LIMIT 100 OFFSET $1::int`, [offset, `%${query}%`]);
    }
}

const pgp = pgPromise({
    extend(obj, dc) {
        obj.pages = new PagesRepository(obj, pgp);
    }
});

pgp.pg.types.setTypeParser(pgp.pg.types.builtins.TIMESTAMP, date => {
    return DateTime.fromSQL(date).toISO();
});

export const db = pgp({
    user: DB_USER,
    password: DB_PASS,
    host: DB_HOST,
    database: DB_NAME,
    port: DB_PORT,
});
