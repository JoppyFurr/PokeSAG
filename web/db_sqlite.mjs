import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { DateTime } from 'luxon';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../pages.sqlite3');

const sqlite = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (error) => {
    if (error) {
        return console.error(error.message);
    }
    console.log('Connected to database file %s', dbPath);
});

function query(sql, params) {
    return new Promise((resolve, reject) => {
        sqlite.all(sql, params, (error, rows) => {
            if (error) return reject(error);
            for (const row of rows) {
                row.rx_date = DateTime.fromSQL(row.rx_date).toISO();
            }
            resolve(rows);
        });
    });
}

const pages = {
    latest(offset=0) {
        return query(`SELECT rowid AS id, rx_date, source, recipient, content FROM pages
            ORDER BY rx_date DESC, recipient ASC
            LIMIT 100 OFFSET ?`, [offset]);
    },

    search(q, offset=0) {
        return query(`SELECT rowid AS id, rx_date, source, recipient, content FROM pages
            WHERE content LIKE ? OR recipient = ?
            ORDER BY rx_date DESC, recipient ASC
            LIMIT 100 OFFSET ?`, [`%${q}%`, q, offset]);
    },

    searchBasic(q, offset=0) {
        return query(`SELECT rowid AS id, rx_date, source, recipient, content FROM pages
            WHERE content LIKE ? OR recipient = ? OR source = ?
            ORDER BY rx_date DESC, recipient ASC
            LIMIT 100 OFFSET ?`, [`%${q}%`, q, q, offset]);
    },

    searchSource(q, offset=0) {
        return query(`SELECT rowid AS id, rx_date, source, recipient, content FROM pages
            WHERE source LIKE ?
            ORDER BY rx_date DESC, recipient ASC
            LIMIT 100 OFFSET ?`, [`%${q}%`, offset]);
    },
};

export const db = { pages };
