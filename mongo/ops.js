let Reviews = require('./userReview.model');
let Games = require('./game.model');

async function getAllReviews() {
    let reviews = await Reviews.find({});

    return reviews;
}

async function getAllGames() {
    let games = await Games.find({});

    console.log(games);

    return games;
}

async function createGame(game_id, title, perc_rec, n_reviewers, game_img_url, override = false) {
    let game = await Games.find({ game_title: title });

    if (game.length > 0) {
        console.log('WARNING: At least one game with this title already exists.\n Here are the game(s) ...\n', game, '\nAdd the -O tag at the to override and add anyway.');
        return;
    }

    let newGame = new Games({
        game_title: title,
        percent_recommended: perc_rec,
        num_reviewers: n_reviewers,
        game_img_url
    });

    let res = await newGame.save();
    // console.log('Game CREATED:  ', res);
    return res;
}

async function getGameByID(id) {
    let game = await Games.findById(id);

    return game;
}

// might want to improve this with some Regex or partial search or something instead of having to do exact match
async function getGamesByTitle(title) {
    let games = await Games.find({ game_title: title });

    // console.log('Games with title - ', title, '\n', games);
    return games;
}

async function filterGamesByPercentRecommended(min, max) {
    let games = [];
    if (min == max) {
        games = await Games.find({ percent_recommended: { $gt: min } });
    } else {
        games = await Games.find({ percent_recommended: { $gt: min, $lt: max } });
    }
    return games;
}

async function filterGamesByNumReviewers(min, max) {
    let games = [];
    if (min == max) {
        games = await Games.find({ num_reviewers: { $gt: min } });
    } else {
        games = await Games.find({ num_reviewers: { $gt: min, $lt: max } });
    }
    return games;
}

async function sortGamesByTitle(order) {
    let games = await Games.aggregate([{ $sort: { game_title: order } }]);
    return games;
}

async function sortGamesByPercentRecommended(order) {
    let games = await Games.aggregate([{ $sort: { percent_recommended: order } }]);
    return games;
}

async function sortGamesByNumReviwers(order) {
    let games = await Games.aggregate([{ $sort: { num_reviewers: order } }]);
    return games;
}

module.exports = {
    getAllReviews,
    getAllGames,
    createGame,
    getGamesByTitle,
    getGameByID,
    filterGamesByPercentRecommended,
    filterGamesByNumReviewers,
    sortGamesByTitle,
    sortGamesByPercentRecommended,
    sortGamesByNumReviwers
}