import express from 'express';
const router = express.Router();
import Game from './../game.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import net from "net";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MAX_GAMES = 10;
const CLEANUP_INTERVAL = 60000; // 1 minute

var games = {};

const cleanUpGames = () => {
    const keys = Object.keys(games);
    let gamesDeleted = 0;
    keys.forEach(key => {
        if (games[key].inactive) {
            delete games[key];
            gamesDeleted++;
        }
    });
};

setInterval(cleanUpGames, CLEANUP_INTERVAL);

const quitGame = (id) => {
    const game = games[id];

    if (!game) {
        console.error('Game not Found.');
        res.sendStatus(500);
    }

    game.delete();

    delete games[id];
}

const BASE_PORT = 5000;
var currentPort = BASE_PORT;

const findNextAvailablePort = () => {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // Port is in use, try next one
                currentPort++;
                resolve(findNextAvailablePort());
            } else {
                reject(err);
            }
        });

        server.once('listening', () => {
            server.close();
            resolve(currentPort);
        });

        server.listen(currentPort);
    });
};

router.get('/download-binary', function(req, res, next) {
    const filePath = path.join(__dirname, './../engines/', 'SandalBotV2.exe');
    res.download(filePath, (err) => {
        if (err) {
            console.error('File download error:', err);
            res.status(500).send('File download failed.');
        }
    });
});

router.get('/start-session', async function(req, res, next) {
    const id = req.session.id;
    try {
        if (id in games) {
            quitGame(id);
        }
        if (Object.keys(games).length >= MAX_GAMES) {
            return res.status(503);
        }
        const port = await findNextAvailablePort();
        games[id] = new Game(port);
        res.status(201).json({ url: "ws://localhost:" + String(port) });
    } catch (error) {
        console.error(error);
    }
});

export default router;