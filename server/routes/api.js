import express from 'express';
const router = express.Router();
import Game from './../game.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var gameIdCounter = 1;
var games = {};

router.get('/download-binary', function(req, res, next) {
    const filePath = path.join(__dirname, './../engines/', 'SandalBotV2.exe');
    res.download(filePath, (err) => {
        if (err) {
            console.error('File download error:', err);
            res.status(500).send('File download failed.');
        }
    });
});

router.post('/start-game', function(req, res, next) {
    console.log(req.session);
    if ('gameId' in req.session) {
        return res.status(400).json({ message: 'Game already in session' });
    }
    games[gameIdCounter] = new Game(gameIdCounter);
    req.session.gameId = gameIdCounter;

    gameIdCounter++;

    res.sendStatus(201);
});

router.post('/start-analysis', function(req, res, next) {
    console.log(req.session);
    if ('gameId' in req.session) {
        return res.status(400).json({ message: 'Game already in session' });
    }
    games[gameIdCounter] = new Game(gameIdCounter);
    console.log(games);
    games[gameIdCounter].startAnalysis();
    req.session.gameId = gameIdCounter;

    gameIdCounter++;

    res.sendStatus(201);
});

router.use(function(req, res, next) {
    if ('gameId' in req.session) {
        next();
    } else {
        res.sendStatus(401);
    }
});

router.post('/generate-move', function(req, res, next) {
    const id = req.session.gameId;
    const fen = req.body.fen;
    const moveTime = req.body.moveTime;
    const game = games[id];

    if (!game) {
        console.error('Game not Found.');
        res.sendStatus(500);
    }

    game.generateMove(fen, moveTime);

    res.sendStatus(200);
});

router.get('/bot-move', function(req, res, next) {
    const id = req.session.gameId;
    const game = games[id];

    if (!game) {
        console.error('Game not Found.');
        res.sendStatus(500);
    }

    const botMove = game.getMove();

    if (botMove) {
        res.status(200).json({ move: botMove });
    } else {
        res.status(202).json({ message: 'Move still being generated' });
    }
});

router.get('/bot-analysis', function(req, res, next) {
    const id = req.session.gameId;
    const game = games[id];

    if (!game) {
        console.error('Game not Found.');
        res.sendStatus(500);
    }

    const analysis = game.getAnalysis();

    res.status(200).json({ analysis: analysis });
});

router.delete('/quit', function(req, res, next) {
    console.log(games);
    const id = req.session.gameId;
    const game = games[id];

    if (!game) {
        console.error('Game not Found.');
        res.sendStatus(500);
    }

    game.killProcess();

    delete games[id];

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Error Deleting Session");
        }
    });
    res.clearCookie('connect.sid');
    res.status(204).send("Session has been destroyed");
});

export default router;