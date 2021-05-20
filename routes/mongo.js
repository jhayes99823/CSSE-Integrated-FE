const ops = require('../mongo/ops');
const express = require('express');
const router = express.Router();
const constants = require('../common/constants');

router.get('/review', (req, res) => {
    ops.getAllReviews().then((result) => {
        res.json({ returnValue: result });
    })
});

router.get('/review/:id', (req, res) => {
    const { id } = req.params;

    ops.getReviewByID(id)
        .then((result) => {
            res.json({ returnValue: result[0] });
        });
});

router.get('/reviews', (req, res) => {
    const { username } = req.query;

    ops.getReviewByUser(username)
        .then((result) => {
            res.json({ returnValue: result });
        });
});

router.post('/reviews', (req, res) => {
    const { username, gameID, recommended, review_text } = req.body;

    ops.addReview(username, gameID, recommended, review_text)
        .then((result) => {
            res.json({ returnValue: result });
        });
});

router.delete('/reviews', (req, res) => {
    const { username, gameID } = req.body;

    ops.deleteReview(username, gameID)
        .then((result) => {
            res.json({ returnValue: result });
        });
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

    if (field == constants.TITLE) {
        ops.sortGamesByTitle(parseInt(order))
            .then((result) => {
                res.json({ returnValue: result });
            });
    }
    if (field == constants.PERCENT_RECOMMENDED) {
        ops.sortGamesByPercentRecommended(parseInt(order))
            .then((result) => {
                res.json({ returnValue: result });
            });
    }
    if (field == constants.NUM_REVIWERS) {
        ops.sortGamesByNumReviwers(parseInt(order))
            .then((result) => {
                res.json({ returnValue: result });
            });
    }
});

router.get('/game/filter', (req, res) => {
    const { min, max, field } = req.query;

    if (field == constants.NUM_REVIWERS) {
        ops.filterGamesByNumReviewers(min, max)
            .then((result) => {
                res.json({ returnValue: result });
            });
    }
    if (field == constants.PERCENT_RECOMMENDED) {
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
            res.json({ returnValue: result[0] });
        });
});

router.get('/game/title/:title', (req, res) => {
    const { title } = req.params;

    ops.getTitleWithGameId(id)
        .then((result) => {
            res.json({ returnValue: result[0] });
        });
});

router.post('/game', async (req, res) => {
    const { game_id, game_title, percent_recommended, game_img_url, num_reviewers } = req.body;

    ops.createGame(game_id, game_title, percent_recommended, num_reviewers, game_img_url)
        .then((result) => {
            res.json({ returnValue: result });
        }).catch((err) => {
            console.log(err);
        })
});

module.exports = router;