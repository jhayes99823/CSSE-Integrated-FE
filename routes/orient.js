const ops = require('../orient');
const express = require('express');
const router = express.Router();


router.get('/recommend', (req, res) => {
    const { userId } = req.query;

    ops.recommendGames(userId)
        .then((result) => {
            res.json({ returnValue: result });
        })
});

router.post('/reviews', (req, res) => {
    const { username, gameID, recommended, review_text } = req.body;

    ops.addReview(username, gameID, recommended)
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

module.exports = router;