const asyncRedis = require('async-redis');
const bcrypt = require('bcryptjs')
const client = asyncRedis.createClient({ port: process.env.REDIS_PORT });
const constants = require('../common/constants');

const USER_LIKED_BASE = '_LIKED';
const USER_DISLIKED_BASE = '_DISLIKED';
const USERNAME_KEY = 'username';
const PASSWORD_KEY = 'password';

function saltPassword(password) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    return hash;
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

    if (!user) {
        console.log(constants.USER_NOT_FOUND);
        return constants.USER_NOT_FOUND;
    }

    let newUser = await client.exists(newusername);
    if (newUser) {
        console.log(constants.USER_ALREADY_EXISTS);
        return constants.USER_ALREADY_EXISTS
    }

    let userPassword = await client.hget(oldusername, PASSWORK_KEY);
    let res = await client.del(oldusername);

    if (res > 0) console.log('User with username: ' + oldusername + ' deleted');

    let newUser = createUser(newusername, userPassword);
    return newUser;
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
    let hashedOld = saltPassword(oldpassword);

    let userPassword = await client.hget(username, PASSWORK_KEY);
    if (userPassword != hashedOld) {
        console.log(constants.USER_NOT_FOUND + "password part");
        return constants.USER_NOT_FOUND;
    }

    // check if new password matches old password
    let currPassword = await client.hget(username, PASSWORD_KEY);

    if (currPassword == newpassword) {
        return constants.NEW_MATCHING_PASSWORD;
    }

    // set new password
    let hashedNew = saltPassword(newpassword);

    let newUser = createUser(username, hashedNew);
    return newUser;
}

// delete user by username
async function deleteUser(username) {
    let user = await client.exists(username);

    if (!user) {
        console.log(constants.USER_NOT_FOUND);
        return constants.USER_NOT_FOUND;
    }

    let retVal = await client.del(username);
    return retVal;
}

async function login(username, password) {
    let user = await client.exists(username);

    if (!user) {
        console.log(constants.USER_NOT_FOUND);
        return constants.USER_NOT_FOUND;
    }

    let userToReturn = await client.hgetall(username);

    const match = await bcrypt.compare(password, userToReturn.password);

    if (!match) return false;

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
    let checkGameExistanceInDisliked = checkIfGameExistsInList(steamID, gameID, 'DISLIKE');

    if (!checkGameExistanceInDisliked) {
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
    let checkGameExistanceInLiked = checkIfGameExistsInList(steamID, gameID, 'LIKED');

    if (!checkGameExistanceInLiked) {
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
        retVal = await client.sismember(steamID + USER_LIKED_BASE, gameID);
    } else {
        retVal = await client.sismember(steamID + USER_DISLIKED_BASE, gameID);
    }

    return retVal == 1 ? true : false;
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
    deleteUser
}