const asyncRedis = require('async-redis');
const bcrypt = require('bcryptjs')
const client = asyncRedis.createClient({ port: 6700 });

const USER_LIKED_BASE = '_LIKED';
const USER_DISLIKED_BASE = '_DISLIKED';

function saltPassword(password) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    return hash;
}

// create user
async function createUser(username, password) {
    let user = await client.exists(username);

    if (user) {
        console.log('user already exists');
        return 'User already exists';
    }

    let hashed = saltPassword(password);

    let result = await client.hset(username, 'username', username, 'password', hashed);

    return result == 2 ? true : false;
}

// update username
async function updateUsername(oldusername, newusername) {
    let user = await client.exists(oldusername);

    if (!user) {
        console.log('user not found');
        return 'User not found';
    }

    let newUser = await client.exists(newusername);
    if (newUser) {
        console.log('user already exists');
        return 'User already exists';
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

async function login(username, password) {
    let user = await client.exists(username);

    if (!user) {
        console.log('user not found');
        return 'User not found';
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
    let gameList = await client.sadd(steamID + USER_LIKED_BASE, gameID);

    if (gameList == 1) {
        console.log('Game Successfully ADDED')
        return true;
    } else {
        console.log('ERROR: Game already exists in set')
        return false;
    }
}

async function deleteGameFromLikedList(steamID, gameID) {
    let gameList = await client.srem(steamID + USER_LIKED_BASE, gameID);

    if (gameList == 1) {
        console.log('Game Successfully REMOVED')
        return true;
    } else {
        console.log('ERROR: Game does not exist in set')
        return false;
    }
}

async function addGameToDislikedList(steamID, gameID) {
    let gameList = await client.sadd(steamID + USER_DISLIKED_BASE, gameID);

    if (gameList == 1) {
        console.log('Game Successfully ADDED')
        return true;
    } else {
        console.log('ERROR: Game already exists in set')
        return false;
    }
}

async function deleteGameFromDislikedList(steamID, gameID) {
    let gameList = await client.srem(steamID + USER_DISLIKED_BASE, gameID);

    if (gameList == 1) {
        console.log('Game Successfully REMOVED')
        return true;
    } else {
        console.log('ERROR: Game does not exist in set')
        return false;
    }
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
    deleteGameFromDislikedList
}