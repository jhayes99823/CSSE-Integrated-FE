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

module.exports = router;