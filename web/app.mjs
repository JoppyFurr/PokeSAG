import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import express from 'express';
import compression from 'compression';
import { db } from './db.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 8080;

app.use(compression());

const TOOLTIP_FILE = process.env.TOOLTIP_FILE || resolve(__dirname, './tooltips.json');
let tooltipsData = '{}';
try {
    tooltipsData = await readFile(TOOLTIP_FILE, 'utf8');
} catch {
    tooltipsData = '{}';
}
app.get('/tooltips.json', (_req, res) => {
    res.type('application/json').send(tooltipsData);
});

app.use(express.static(resolve(__dirname, './client/public'), { index: ['index.html'], maxAge: '1h' }));
app.use(express.static(resolve(__dirname, './client/dist'), { maxAge: '7d' }));

function GET(url, handler) {
    app.get(url, async (req, res) => {
        try {
            const data = await handler(req);
            res.json({ success: true, data });
        } catch (error) {
            console.error('API error:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
}

function offset(req) {
    return Math.max(0, (parseInt(req.params.page, 10) - 1) * 100) || 0;
}

GET('/pages/', () => db.pages.latest());
GET('/pages/:page/', req => db.pages.latest(offset(req)));

GET('/pages/search/ft/:q/', req => db.pages.search(req.params.q));
GET('/pages/search/ft/:q/:page/', req => db.pages.search(req.params.q, offset(req)));

GET('/pages/search/basic/:q/', req => db.pages.searchBasic(req.params.q));
GET('/pages/search/basic/:q/:page/', req => db.pages.searchBasic(req.params.q, offset(req)));

GET('/pages/search/source/:q/', req => db.pages.searchSource(req.params.q));
GET('/pages/search/source/:q/:page/', req => db.pages.searchSource(req.params.q, offset(req)));

const server = app.listen(port, '::', () => {
    console.log('Listening on port %s.', server.address().port);
});
