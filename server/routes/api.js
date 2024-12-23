import express from 'express';
const router = express.Router();
import Game from './../game.js';

var gameIdCounter = 1;
var games = [];

router.post('/start-game', function(req, res, next) {
    console.log(req.session);
    if ('gameId' in req.session) {
        return res.status(400).json({ message: 'Game already in session' });
    }
    games.push(new Game(gameIdCounter, req.body.goFirst));
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

router.post('/make-move', function(req, res, next) {
    const id = req.session.gameId;
    const move = req.body.move;
    const game = games.find(item => item.id === id);

    if (!game) {
        console.error('Game not Found.');
        res.sendStatus(500);
    }

    game.inputMove(move);

    res.sendStatus(200);

    game.generateMove();

    console.log('outside generatemove');
});

router.get('/bot-move', function(req, res, next) {
    const id = req.session.gameId;
    const game = games.find(item => item.id === id);

    if (!game) {
        console.error('Game not Found.');
        res.sendStatus(500);
    }

    const botMove = game.getMove();

    if (botMove) {
        res.status(200).json({ move: botMove, check: false });
    } else {
        res.status(202).json({ message: 'Move still being generated' });
    }
});

router.delete('/quit', function(req, res, next) {
    console.log(games);
    const id = req.session.gameId;
    const index = games.findIndex(item => item.id === id);
    const game = games[index];

    if (!game) {
        console.error('Game not Found.');
        res.sendStatus(500);
    }

    game.killProcess();

    games.splice(index, 1);

    console.log(games);
    console.log(games.length);

    req.session.gameId = null;
    
    res.sendStatus(204);
});

export default router;