const ops = require('../mongo/ops');
const express = require('express');
const router = express.Router();

router.get('/review', (req, res) => {
    ops.getAllReviews().then((result) => {
        res.json({ returnValue: result });
    })
});

router.get('/game', (req, res) => {
    const { title } = req.query;

    if (title) {
        ops.getGamesByTitle(title)
            .then((result) => {
                res.json({ returnValue: result });
            });
    } else {
        ops.getAllGames().then((result) => {
            res.json({ returnValue: result });
        });
    }
});

router.get('/game/sort', (req, res) => {
    const { order, field } = req.query;

    if (field == "TITLE") {
        ops.sortGamesByTitle(parseInt(order))
            .then((result) => {
                res.json({ returnValue: result });
            });
    }
    if (field == "PERCENT_RECOMMENDED") {
        ops.sortGamesByPercentRecommended(parseInt(order))
            .then((result) => {
                res.json({ returnValue: result });
            });
    }
    if (field == "NUM_REVIEWERS") {
        ops.sortGamesByNumReviwers(parseInt(order))
            .then((result) => {
                res.json({ returnValue: result });
            });
    }
});

router.get('/game/filter', (req, res) => {
    const { min, max, field } = req.query;

    if (field == "NUM_REVIEWERS") {
        ops.filterGamesByNumReviewers(min, max)
            .then((result) => {
                res.json({ returnValue: result });
            });
    }
    if (field == "PERCENT_RECOMMENDED") {
        ops.filterGamesByPercentRecommended(min, max)
            .then((result) => {
                res.json({ returnValue: result });
            });
    }
});

router.get('/game/:id', (req, res) => {
    const { id } = req.params;

    ops.getGameByID(id)
        .then((result) => {
            res.json({ returnValue: result });
        });
});

router.post('/game', (req, res) => {
    const { game_title, percent_recommended, game_img_url, num_reviewers } = req.body;

    ops.createGame(null, game_title, percent_recommended, num_reviewers, game_img_url)
        .then((result) => {
            res.json({ returnValue: result });
        });
});

module.exports = router;