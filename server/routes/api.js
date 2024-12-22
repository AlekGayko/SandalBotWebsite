const express = require('express');
const router = express.Router();
const Game = require('game.js');

var gameIdCounter = 1;
var games = [];

router.post('/start-game', function(req, res, next) {
    games.push(new Game(gameIdCounter, req.body.whiteTurn));
    req.session.gameId = gameIdCounter;

    gameIdCounter++;
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
    game.generateMove();
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

module.exports = router;