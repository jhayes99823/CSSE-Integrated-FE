// ROUTE QUERY PARAM CONSTANTS
const NUM_REVIWERS = 'NUM_REVIEWERS';
const PERCENT_RECOMMENDED = "PERCENT_RECOMMENDED";
const TITLE = 'TITLE';

// ERROR MESSAGE CONSTANTS
const USER_NOT_FOUND = 'User Not Found';
const USER_ALREADY_EXISTS = 'User Already Exists';
const GAME_ALREADY_EXISTS = 'Game Already Exists';
const GAME_NOT_FOUND = 'Game Does Not Exist';
const GAME_CROSSOVER = 'Game Cannot Be Liked And Disliked';
const NEW_MATCHING_PASSWORD = 'New password cannot match old password';

// SUCCESS MESSAGES
const GAME_ADDED = 'Game Successfully Added';
const GAME_REMOVED = 'Game Successfully Removed';

const REDIS_PONG_RESPONSE = 'PONG';

module.exports = {
    NUM_REVIWERS,
    PERCENT_RECOMMENDED,
    TITLE,
    USER_NOT_FOUND,
    USER_ALREADY_EXISTS,
    GAME_ALREADY_EXISTS,
    GAME_ADDED,
    GAME_REMOVED,
    GAME_NOT_FOUND,
    GAME_CROSSOVER,
    NEW_MATCHING_PASSWORD,
    REDIS_PONG_RESPONSE
};