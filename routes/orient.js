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

module.exports = router;