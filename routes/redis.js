const ops = require('../redis');
const express = require('express');
const router = express.Router();
const kafka = require('../kafka/index');
const constants = require('../common/constants');

router.post('/user', async (req, res) => {
    const { username, password } = req.body;

    ops.ping()
        .then(async (retVal) => {
            if (retVal === constants.REDIS_PONG_RESPONSE) {
                ops.createUser(username, password)
                    .then((result) => {
                        res.json({ returnValue: result });
                    });
            } else {
                await kafka.producer.connect();

                const kafkaObj = {
                    'request-type': 'create user',
                    'username': username,
                    'password': password
                };

                await kafka.producer.send({
                    topic: 'testTopic',
                    messages: [
                        { key: 'new user', value: JSON.stringify(kafkaObj) },
                    ]
                });
            }
        })
});

router.delete('/user', (req, res) => {
    const { username } = req.body;

    ops.deleteUser(username)
        .then((result) => {
            res.json({ returnValue: result });
        });
})

router.post('/user/username', (req, res) => {
    const { currUsername, newUsername } = req.body;
    ops.updateUsername(currUsername, newUsername)
        .then((result) => {
            res.json({ returnValue: result });
        });
});

router.post('/user/password', (req, res) => {
    const { username, oldpassword, newpassword } = req.body;
    ops.updatePassword(username, oldpassword, newpassword)
        .then((result) => {
            res.json({ returnValue: result });
        });
});

router.get('/user', (req, res) => {
    const { username } = req.query;

    ops.getUser(username)
        .then((result) => {
            res.json({ returnValue: result });
        })
});

router.post('/login', (req, res) => {
    console.log('made it here   ', req.body);
    const { username, password } = req.body;

    ops.login(username, password)
        .then((result) => {
            console.log('getting redis server results  ', result);
            res.send({ returnValue: result });
        });
});

router.get('/like', (req, res) => {
    const { username } = req.query;

    ops.getLikedGamesByUserId(username)
        .then((result) => {
            res.json({ returnValue: result });
        });
});

router.post('/like', (req, res) => {
    const { username, gameID } = req.body;

    ops.addGamesToLikedList(username, gameID)
        .then((result) => {
            res.json({ returnValue: result });
        });
});

router.delete('/like', (req, res) => {
    const { username, gameID } = req.body;

    ops.deleteGameFromLikedList(username, gameID)
        .then((result) => {
            res.json({ returnValue: result });
        });
});

router.get('/dislike', (req, res) => {
    const { username } = req.query;

    ops.getDislikedGamesByUserId(username)
        .then((result) => {
            res.json({ returnValue: result });
        });
});

router.post('/dislike', (req, res) => {
    const { username, gameID } = req.body;

    ops.addGameToDislikedList(username, gameID)
        .then((result) => {
            res.json({ returnValue: result });
        });
});

router.delete('/dislike', (req, res) => {
    const { username, gameID } = req.body;

    console.log('username ', username, '   gameID  ', gameID);

    ops.deleteGameFromDislikedList(username, gameID)
        .then((result) => {
            res.json({ returnValue: result });
        });
});

module.exports = router;