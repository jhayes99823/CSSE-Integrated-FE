var ODatabase = require('orientjs').ODatabase;
const constants = require('../common/constants');
const kafka = require('../kafka/index');
const orient = require('../common/database_status');

var db = new ODatabase({
    host: '433-21.csse.rose-hulman.edu',
    port: 2424,
    username: 'root',
    password: 'pheeN7wi',
    name: '433project'
});

db.on("endQuery", async function (obj) {
    console.log("DEBUG QUERY:", obj);

    if (obj.err != undefined) {
        orient.setOrientStatus(false);
    } else {
        console.log('orient db kafka part');
        await kafka.orientConsumer.connect();

        await kafka.orientConsumer.subscribe({ topic: 'testTopic', fromBeginning: true })

        await kafka.orientConsumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log({
                    value: message.value.toString(),
                });

                if (message.key == constants.CREATE_REVIEW_ORIENT) {
                    const { username, gameID, recommended } = JSON.parse(message.value);
                    addReview(username, gameID, recommended);
                }

                if (message.key == constants.DELETE_REVIEW_ORIENT) {
                    const { username, gameID } = JSON.parse(message.value);
                    deleteReview(username, gameID);
                }
            }
        });
    }
});

async function ping() {
    return _ping();
}

function _ping() {
    return db.query(
        'SELECT 1 AS a'
    ).then((res) => {
        console.log(`res from ping`, res)
        return res;
    }).catch((err) => {
        console.log('ping function not working  ', err);
    });
}

async function recommendGames(userId) {
    console.log(`userId`, userId);
    return await _recommendGames(userId)
}

function _recommendGames(userId) {
    const recStr = `SELECT game, SUM(score) AS score FROM (SELECT score, id.out().name AS game FROM (SELECT EVAL('score - anti_score') AS score, id, name FROM
    (SELECT SUM(score) AS score, SUM(anti_score) AS anti_score, id, name FROM
    (SELECT EXPAND($union)
    LET $a = (SELECT COUNT(@rid) AS score, @rid AS id, name FROM (SELECT EXPAND(OUT('does_not_recommend').IN('does_not_recommend')) FROM User WHERE name = :userId ) WHERE name != :userId  GROUP BY @rid),
    $b = (SELECT COUNT(@rid) AS score, @rid AS id, name FROM (SELECT EXPAND(OUT('recommends').IN('recommends')) FROM User WHERE name = :userId ) WHERE name != :userId  GROUP BY @rid),
    $c = (SELECT COUNT(@rid) AS anti_score, @rid AS id, name FROM (SELECT EXPAND(OUT('does_not_recommend').IN('Likes')) FROM User WHERE name = :userId ) WHERE name != :userId  GROUP BY @rid),
    $d = (SELECT COUNT(@rid) AS anti_score, @rid AS id, name FROM (SELECT EXPAND(OUT('recommends').IN('does_not_recommend')) FROM User WHERE name = :userId ) WHERE name != :userId  GROUP BY @rid),
    $e = (SELECT @rid AS id, name FROM User WHERE name != :userId ),
    $union = UNIONALL($a, $b, $c, $d, $e))
    GROUP BY id))
    UNWIND game)
    WHERE game NOT IN (SELECT OUT().name FROM User WHERE name = :userId )
    GROUP BY game
    ORDER BY score DESC
    LIMIT 12`;

    return db.query(
        recStr,
        { params: { userId: userId } }
    ).then((res) => {
        console.log(`userId`, userId);
        let gameIds = [];
        console.log(`res`, res);
        for (let i = 0; i < res.length; i++) {
            gameIds.push(res[i].game);
        }
        console.log(`gameIds`, gameIds);
        return gameIds;
    }).catch((err) => {
        console.log('error getting recommendations direct from DB ', err);
    });
}

async function addReview(username, gameID, recommended) {
    if (!(await _userExists(username))) {
        await _addUser(username);
    }
    if (!(await _gameExists(gameID))) {
        await _addGame(gameID);
    }
    return await _addReview(username, gameID, recommended);
}

function _userExists(username) {
    return db.query(
        'SELECT FROM User WHERE name = :username',
        { params: { username } }
    ).then((res) => {
        return res.length != 0;
    }).catch((err) => {
        console.log('error checking whether user exists  ', err);
    });
}

function _addUser(username) {
    return db.query(
        'CREATE VERTEX User SET name = :username',
        { params: { username } }
    ).then((res) => {
    }).catch((err) => {
        console.log('error checking whether you can add a user   ', err);
    });
}

function _gameExists(gameID) {
    return db.query(
        'SELECT FROM Game WHERE name = :gameID',
        { params: { gameID } }
    ).then((res) => {
        return res.length != 0;
    }).catch((err) => {
        console.log('error checking whether a game exists   ', err);
    });
}

function _addGame(gameID) {
    return db.query(
        'CREATE VERTEX Game SET name = :gameID',
        { params: { gameID } }
    ).then((res) => {
    }).catch((err) => {
        console.log('error adding a game   ', err);
    });
}

function _addReview(username, gameID, recommend) {
    if (recommend) {
        return db.query(
            'CREATE EDGE recommends FROM (SELECT FROM User WHERE name = :username) TO (SELECT FROM Game WHERE name = :gameID)',
            { params: { username, gameID } }
        ).then((res) => {
            return true
        }).catch((err) => {
            console.log('error adding does recommend edge    ', err);
        });
    } else {
        return db.query(
            'CREATE EDGE does_not_recommend FROM (SELECT FROM User WHERE name = :username) TO (SELECT FROM Game WHERE name = :gameID)',
            { params: { username, gameID } }
        ).then((res) => {
            return true
        }).catch((err) => {
            console.log('error adding a does not recommend edge   ', err);
        });
    }

}

async function deleteReview(username, gameID) {
    return await _deleteReview(username, gameID);
}

function _deleteReview(username, gameID) {
    return db.query(
        'DELETE EDGE FROM (SELECT FROM User WHERE name = :username) TO (SELECT FROM Game WHERE name = :gameID)',
        { params: { username, gameID } }
    ).then((res) => {
        return true
    }).catch((err) => {
        console.log('error deleting review   ', err);
    });
}

module.exports = { ping, recommendGames, deleteReview, addReview };