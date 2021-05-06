const asyncRedis = require('async-redis');
const client = asyncRedis.createClient({ port: 6700 });

const USER_LIKED_BASE = '_LIKED';
const USER_DISLIKED_BASE = '_DISLIKED';