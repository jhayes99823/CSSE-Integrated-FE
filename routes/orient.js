const ops = require('../orient');
const express = require('express');
const router = express.Router();
const orient = require('../common/database_status');
const kafka = require('../kafka/index');
const constants = require('../common/constants');

router.get('/recommend', (req, res) => {
    const { userId } = req.query;

    ops.recommendGames(userId)
        .then((result) => {
            res.json({ returnValue: result });
        })
});

router.post('/reviews', async (req, res) => {
    const { username, gameID, recommended, review_text } = req.body;

    ops.ping()
        .then(async (result) => {
            const status = orient.getOrientStatus();
            console.log(`status`, status)
            if (status) {
                ops.addReview(username, gameID, recommended)
                    .then((result) => {
                        res.json({ returnValue: result });
                    });
            } else {
                await kafka.producer.connect();

                const kafkaObj = {
                    'username': username,
                    'gameID': gameID,
                    'recommended': recommended
                };

                await kafka.producer.send({
                    topic: 'testTopic',
                    messages: [
                        { key: constants.CREATE_REVIEW_ORIENT, value: JSON.stringify(kafkaObj) },
                    ]
                });

                res.json({ returnValue: 'ORIENT SERVER DOWN' })

                await kafka.producer.disconnect();

            }
        })
        .catch(err => {
            console.log(`error with ping   `, err);

            res.json({ returnValue: 'error with ping ', err });
        });
});

router.delete('/reviews', async (req, res) => {
    const { username, gameID } = req.body;

    ops.ping()
        .then(async (result) => {
            const status = orient.getOrientStatus();
            console.log(`status`, status)
            if (status) {
                ops.deleteReview(username, gameID)
                    .then((result) => {
                        res.json({ returnValue: result });
                    });
            } else {
                await kafka.producer.connect();

                const kafkaObj = {
                    'username': username,
                    'gameID': gameID
                };

                await kafka.producer.send({
                    topic: 'testTopic',
                    messages: [
                        { key: constants.DELETE_REVIEW_ORIENT, value: JSON.stringify(kafkaObj) },
                    ]
                });

                res.json({ returnValue: 'ORIENT SERVER DOWN' })

                await kafka.producer.disconnect();

            }
        })
        .catch(err => {
            console.log(`error with ping   `, err);

            res.json({ returnValue: 'error with ping ', err });
        });
});

module.exports = router;