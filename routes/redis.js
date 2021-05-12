const ops = require('../redis');
const express = require('express');
const router = express.Router();

router.post('/user', (req, res) => {
    const { username, password } = req.body;
    ops.createUser(username, password)
        .then((result) => {
            res.json({ returnValue: result });
        });
});

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