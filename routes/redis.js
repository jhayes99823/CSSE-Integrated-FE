const ops = require('../redis');
const express = require('express');
const router = express.Router();
const kafka = require('../kafka/index');
const constants = require('../common/constants');

router.post('/user', async (req, res) => {
    const { username, password } = req.body;

    ops.ping()
        .then(async (retVal) => {
            console.log(`retVal`, retVal);
            if (retVal === constants.REDIS_PONG_RESPONSE) {
                console.log('NOPE made it here');
                ops.createUser(username, password)
                    .then((result) => {
                        res.json({ returnValue: result });
                    })
                    .catch((err) => {
                        console.log('create user error   ', err);
                    })
            }
        })
        .catch(async (err) => {
            console.log(err);
            await kafka.producer.connect();

            const kafkaObj = {
                'username': username,
                'password': password
            };

            await kafka.producer.send({
                topic: 'testTopic',
                messages: [
                    { key: constants.CREATE_USER, value: JSON.stringify(kafkaObj) },
                ]
            });

            res.json({ returnValue: 'REDIS SERVER DOWN' })

            await kafka.producer.disconnect();
        });
});

router.delete('/user', (req, res) => {
    const { username } = req.body;

    ops.ping()
        .then(async (retVal) => {
            if (retVal === constants.REDIS_PONG_RESPONSE) {
                ops.deleteUser(username)
                    .then((result) => {
                        res.json({ returnValue: result });
                    })
                    .catch((err) => {
                        console.log('delete user error   ', err);
                    })
            }
        })
        .catch(async (err) => {
            console.log(err);
            await kafka.producer.connect();

            const kafkaObj = {
                'username': username
            };

            await kafka.producer.send({
                topic: 'testTopic',
                messages: [
                    { key: constants.DELETE_USER, value: JSON.stringify(kafkaObj) },
                ]
            });

            res.json({ returnValue: 'REDIS SERVER DOWN' })

            await kafka.producer.disconnect();
        });

})

router.post('/user/username', (req, res) => {
    const { currUsername, newUsername } = req.body;

    ops.ping()
        .then(async (retVal) => {
            if (retVal === constants.REDIS_PONG_RESPONSE) {
                ops.updateUsername(currUsername, newUsername)
                    .then((result) => {
                        res.json({ returnValue: result });
                    })
                    .catch((err) => {
                        console.log('update user username error   ', err);
                    })
            }
        })
        .catch(async (err) => {
            console.log(err);
            await kafka.producer.connect();

            const kafkaObj = {
                'currUsername': currUsername,
                'newUsername': newUsername
            };

            await kafka.producer.send({
                topic: 'testTopic',
                messages: [
                    { key: constants.UPDATE_USERNAME, value: JSON.stringify(kafkaObj) },
                ]
            });

            res.json({ returnValue: 'REDIS SERVER DOWN' })

            await kafka.producer.disconnect();
        });


});

router.post('/user/password', (req, res) => {
    const { username, oldpassword, newpassword } = req.body;

    ops.ping()
        .then(async (retVal) => {
            if (retVal === constants.REDIS_PONG_RESPONSE) {
                ops.updatePassword(username, oldpassword, newpassword)
                    .then((result) => {
                        res.json({ returnValue: result });
                    })
                    .catch((err) => {
                        console.log('update user password error   ', err);
                    })
            }
        })
        .catch(async (err) => {
            console.log(err);
            await kafka.producer.connect();

            const kafkaObj = {
                'username': username,
                'oldpassword': oldpassword,
                'newpassword': newpassword
            };

            await kafka.producer.send({
                topic: 'testTopic',
                messages: [
                    { key: constants.UPDATE_PASSWORD, value: JSON.stringify(kafkaObj) },
                ]
            });

            res.json({ returnValue: 'REDIS SERVER DOWN' })

            await kafka.producer.disconnect();
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
            res.send({ returnValue: result });
        })
        .catch(async (err) => {
            console.log('trying to login')
            console.log(err);

            res.json({ returnValue: 'REDIS SERVER DOWN - ATTEMPT LOGIN' })
        });
});

router.get('/like', (req, res) => {
    const { username } = req.query;

    ops.ping()
        .then(async (retVal) => {
            if (retVal === constants.REDIS_PONG_RESPONSE) {
                ops.getLikedGamesByUserId(username)
                    .then((result) => {
                        res.json({ returnValue: result });
                    })
                    .catch((err) => {
                        console.log('get liked games error   ', err);
                    })
            }
        })
        .catch(async (err) => {
            console.log(err);

            res.json({ returnValue: 'REDIS SERVER DOWN' })
        });
});

router.post('/like', (req, res) => {
    const { username, gameID } = req.body;

    ops.ping()
        .then(async (retVal) => {
            if (retVal === constants.REDIS_PONG_RESPONSE) {
                ops.addGamesToLikedList(username, gameID)
                    .then((result) => {
                        res.json({ returnValue: result });
                    })
                    .catch((err) => {
                        console.log('add liked game error   ', err);
                    })
            }
        })
        .catch(async (err) => {
            console.log(err);
            await kafka.producer.connect();

            const kafkaObj = {
                'username': username,
                'gameID': gameID
            };

            await kafka.producer.send({
                topic: 'testTopic',
                messages: [
                    { key: constants.ADD_LIKED_GAME, value: JSON.stringify(kafkaObj) },
                ]
            });

            res.json({ returnValue: 'REDIS SERVER DOWN' })

            await kafka.producer.disconnect();
        });
});

router.delete('/like', (req, res) => {
    const { username, gameID } = req.body;

    ops.ping()
        .then(async (retVal) => {
            if (retVal === constants.REDIS_PONG_RESPONSE) {
                ops.deleteGameFromLikedList(username, gameID)
                    .then((result) => {
                        res.json({ returnValue: result });
                    })
                    .catch((err) => {
                        console.log('delete liked game error   ', err);
                    })
            }
        })
        .catch(async (err) => {
            console.log(err);
            await kafka.producer.connect();

            const kafkaObj = {
                'username': username,
                'gameID': gameID
            };

            await kafka.producer.send({
                topic: 'testTopic',
                messages: [
                    { key: constants.REMOVE_LIKED_GAME, value: JSON.stringify(kafkaObj) },
                ]
            });

            res.json({ returnValue: 'REDIS SERVER DOWN' })

            await kafka.producer.disconnect();
        });
});

router.get('/dislike', (req, res) => {
    const { username } = req.query;

    ops.ping()
        .then(async (retVal) => {
            if (retVal === constants.REDIS_PONG_RESPONSE) {
                ops.getDislikedGamesByUserId(username)
                    .then((result) => {
                        res.json({ returnValue: result });
                    })
                    .catch((err) => {
                        console.log('get disliked error   ', err);
                    })
            }
        })
        .catch(async (err) => {
            console.log(err);

            res.json({ returnValue: 'REDIS SERVER DOWN' })
        });
});

router.post('/dislike', (req, res) => {
    const { username, gameID } = req.body;

    ops.ping()
        .then(async (retVal) => {
            if (retVal === constants.REDIS_PONG_RESPONSE) {
                ops.addGameToDislikedList(username, gameID)
                    .then((result) => {
                        res.json({ returnValue: result });
                    })
                    .catch((err) => {
                        console.log('add disliked game error   ', err);
                    })
            }
        })
        .catch(async (err) => {
            console.log(err);
            await kafka.producer.connect();

            const kafkaObj = {
                'username': username,
                'gameID': gameID
            };

            await kafka.producer.send({
                topic: 'testTopic',
                messages: [
                    { key: constants.ADD_DISLIKED_GAME, value: JSON.stringify(kafkaObj) },
                ]
            });

            res.json({ returnValue: 'REDIS SERVER DOWN' })

            await kafka.producer.disconnect();
        });
});

router.delete('/dislike', (req, res) => {
    const { username, gameID } = req.body;

    ops.ping()
        .then(async (retVal) => {
            if (retVal === constants.REDIS_PONG_RESPONSE) {
                ops.deleteGameFromDislikedList(username, gameID)
                    .then((result) => {
                        res.json({ returnValue: result });
                    })
                    .catch((err) => {
                        console.log('delete disliked game error   ', err);
                    })
            }
        })
        .catch(async (err) => {
            console.log(err);
            await kafka.producer.connect();

            const kafkaObj = {
                'username': username,
                'gameID': gameID
            };

            await kafka.producer.send({
                topic: 'testTopic',
                messages: [
                    { key: constants.REMOVE_DISLIKED_GAME, value: JSON.stringify(kafkaObj) },
                ]
            });

            res.json({ returnValue: 'REDIS SERVER DOWN' })

            await kafka.producer.disconnect();
        });
});

module.exports = router;