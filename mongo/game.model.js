const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Game = new Schema({
    game_title: {
        type: String
    },
    percent_recommended: {
        type: Number
    },
    num_reviewers: {
        type: Number
    },
    game_img_url: {
        type: String
    }
});

module.exports = mongoose.model('games', Game);