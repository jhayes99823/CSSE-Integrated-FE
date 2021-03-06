const asyncRedis = require('async-redis');
const bcrypt = require('bcryptjs')
const kafka = require('../kafka/index');
const client = asyncRedis.createClient({
    retry_strategy: function (options) {
        if (options.error && options.error.code === "ECONNREFUSED") {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error("The server refused the connection");
        }
        if (options.total_retry_time > 1000 * 60 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands
            // with a individual error
            return new Error("Retry time exhausted");
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    },
});
const constants = require('../common/constants');

client.on("ready", async function (err) {
    await kafka.consumer.connect();

    await kafka.consumer.subscribe({ topic: 'testTopic', fromBeginning: true })

    await kafka.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                value: message.value.toString(),
            });

            if (message.key == constants.CREATE_USER) {
                const { username, password } = JSON.parse(message.value);
                createUser(username, password);
            }

            if (message.key == constants.DELETE_USER) {
                const { username } = JSON.parse(message.value);
                deleteUser(username);
            }

            if (message.key == constants.UPDATE_USERNAME) {
                const { currUsername, newUsername } = JSON.parse(message.value);
                updateUsername(currUsername, newUsername);
            }

            if (message.key == constants.UPDATE_PASSWORD) {
                const { username, oldpassword, newpassword } = JSON.parse(message.value);
                updatePassword(username, oldpassword, newpassword);
            }

            if (message.key == constants.ADD_LIKED_GAME) {
                const { username, gameID } = JSON.parse(message.value);
                addGamesToLikedList(username, gameID);
            }

            if (message.key == constants.REMOVE_LIKED_GAME) {
                const { username, gameID } = JSON.parse(message.value);
                deleteGameFromLikedList(username, gameID);
            }

            if (message.key == constants.ADD_DISLIKED_GAME) {
                const { username, gameID } = JSON.parse(message.value);
                addGameToDislikedList(username, gameID);
            }

            if (message.key == constants.REMOVE_DISLIKED_GAME) {
                const { username, gameID } = JSON.parse(message.value);
                deleteGameFromDislikedList(username, gameID)
            }
        },
    });
});

client.on("error", function (error) {
    console.log(error);
});

const USER_LIKED_BASE = '_LIKED';
const USER_DISLIKED_BASE = '_DISLIKED';
const USERNAME_KEY = 'username';
const PASSWORD_KEY = 'password';

function saltPassword(password) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    return hash;
}

async function ping() {
    return await client.ping();
}

// create user
async function createUser(username, password) {
    let user = await client.exists(username);

    if (user) {
        console.log(constants.USER_ALREADY_EXISTS);
        return constants.USER_ALREADY_EXISTS;
    }

    let hashed = saltPassword(password);

    let result = await client.hset(username, USERNAME_KEY, username, PASSWORD_KEY, hashed);

    return result == 2 ? true : false;
}

// update username
async function updateUsername(oldusername, newusername) {
    let user = await client.exists(oldusername);

    // check oldusername of user exists
    if (!user) {
        console.log(constants.USER_NOT_FOUND);
        return constants.USER_NOT_FOUND;
    }

    // check newusername user wants DOESNT exists
    let newUser = await client.exists(newusername);
    if (newUser) {
        console.log(constants.USER_ALREADY_EXISTS);
        return constants.USER_ALREADY_EXISTS
    }

    // get the password
    let userPassword = await client.hget(oldusername, PASSWORD_KEY);

    // delete old user with oldusername
    let res = await client.del(oldusername);
    if (res > 0) console.log('User with username: ' + oldusername + ' deleted');

    // set new user
    let result = await client.hset(newusername, USERNAME_KEY, newusername, PASSWORD_KEY, userPassword);

    // update liked games list with newusername
    let likeGames = await client.smembers(oldusername + USER_LIKED_BASE);
    console.log(`likeGames`, likeGames);
    let result2 = await client.del(oldusername + USER_LIKED_BASE);
    for (let game of likeGames) {
        await addGamesToLikedList(newusername, game);
    }
    // let newliked = await client.sadd(newusername + USER_LIKED_BASE, ...likeGames)
    // console.log(likeGames.length, '  vs  ', newliked);

    // update disliked games list with newusername
    let dislikedGames = await client.smembers(oldusername + USER_DISLIKED_BASE);
    console.log(`dislikedGames`, dislikedGames);
    let result3 = await client.del(oldusername + USER_DISLIKED_BASE);
    for (let game of dislikedGames) {
        await addGameToDislikedList(newusername, game);
    }

    return result == 2 ? true : false;
}

async function getUser(username) {
    let userToReturn = await client.hgetall(username);

    return userToReturn;
}

// update password
async function updatePassword(username, oldpassword, newpassword) {
    // check if user exists
    let user = await client.exists(username);

    if (!user) {
        console.log(constants.USER_NOT_FOUND);
        return constants.USER_NOT_FOUND;
    }

    // check if old passwords match
    let userPassword = await client.hget(username, PASSWORD_KEY);
    let matched = await bcrypt.compare(oldpassword, userPassword);
    if (matched == false) {
        console.log(constants.USER_NOT_FOUND + "password part");
        return constants.USER_NOT_FOUND;
    }

    // check if new password matches old password
    let matchedNew = await bcrypt.compare(newpassword, userPassword);
    if (matchedNew == true) {
        return constants.NEW_MATCHING_PASSWORD;
    }

    // set new password
    let hashedNew = saltPassword(newpassword);

    let retVal = await client.hset(username, PASSWORD_KEY, hashedNew);

    return retVal;
}

// delete user by username
async function deleteUser(username) {
    let user = await client.exists(username);

    if (!user) {
        console.log(constants.USER_NOT_FOUND);
        return constants.USER_NOT_FOUND;
    }

    let retVal = await client.del(username);
    let retVal2 = await client.del(username + USER_LIKED_BASE);
    let retVal3 = await client.del(username + USER_DISLIKED_BASE);

    return retVal;
}

async function login(username, password) {
    let user = await client.exists(username);

    if (!user) {
        console.log(constants.USER_NOT_FOUND);
        return constants.USER_NOT_FOUND;
    }

    let userToReturn = await client.hgetall(username);

    console.log('usertoReturn   ', userToReturn.password, '     ', password);

    const match = await bcrypt.compare(password, userToReturn.password.toString());

    console.log(`match`, match)

    if (!match) return constants.USER_NOT_FOUND;

    return userToReturn;
}

async function getLikedGamesByUserId(userId, low = 0, high = -1) {
    let userToReturn = await client.smembers(userId + USER_LIKED_BASE);

    return userToReturn;
}

async function getDislikedGamesByUserId(userId, low = 0, high = -1) {
    let userToReturn = await client.smembers(userId + USER_DISLIKED_BASE);

    return userToReturn;
}

async function addGamesToLikedList(steamID, gameID) {
    let checkGameExistanceInDisliked = await checkIfGameExistsInList(steamID, gameID, 'DISLIKED');

    if (checkGameExistanceInDisliked == 0) {
        console.log('i made it');
        let gameList = await client.sadd(steamID + USER_LIKED_BASE, gameID);

        if (gameList == 1) {
            console.log(constants.GAME_ADDED)
            return true;
        } else {
            console.log(constants.GAME_ALREADY_EXISTS)
            return false;
        }
    } else {
        return constants.GAME_CROSSOVER;
    }
}

async function deleteGameFromLikedList(steamID, gameID) {
    let gameList = await client.srem(steamID + USER_LIKED_BASE, gameID);

    if (gameList == 1) {
        console.log(constants.GAME_REMOVED)
        return true;
    } else {
        console.log(constants.GAME_NOT_FOUND)
        return false;
    }
}

async function addGameToDislikedList(steamID, gameID) {
    let checkGameExistanceInLiked = await checkIfGameExistsInList(steamID, gameID, 'LIKED');

    if (checkGameExistanceInLiked == 0) {
        let gameList = await client.sadd(steamID + USER_DISLIKED_BASE, gameID);

        if (gameList == 1) {
            console.log(constants.GAME_ADDED)
            return true;
        } else {
            console.log(constants.GAME_ALREADY_EXISTS)
            return false;
        }
    } else {
        return constants.GAME_CROSSOVER;
    }
}

async function deleteGameFromDislikedList(steamID, gameID) {
    let gameList = await client.srem(steamID + USER_DISLIKED_BASE, gameID);

    if (gameList == 1) {
        console.log(constants.GAME_REMOVED)
        return true;
    } else {
        console.log(constants.GAME_NOT_FOUND)
        return false;
    }
}

async function checkIfGameExistsInList(steamID, gameID, listType) {
    let retVal = null;

    if (listType === 'LIKED') {
        console.log('checking for game in liked list');
        retVal = await client.sismember(steamID + USER_LIKED_BASE, gameID);
    } else {
        console.log('checking for game in disliked list')
        retVal = await client.sismember(steamID + USER_DISLIKED_BASE, gameID);
    }

    console.log(`retVal`, retVal);

    return retVal;
}

module.exports = {
    createUser,
    updateUsername,
    getUser,
    login,
    getLikedGamesByUserId,
    getDislikedGamesByUserId,
    addGamesToLikedList,
    addGameToDislikedList,
    deleteGameFromLikedList,
    deleteGameFromDislikedList,
    updatePassword,
    deleteUser,
    ping
}