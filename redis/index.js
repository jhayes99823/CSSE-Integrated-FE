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

module.exports = {
    createUser,
    updateUsername,
    getUser,
    login
}