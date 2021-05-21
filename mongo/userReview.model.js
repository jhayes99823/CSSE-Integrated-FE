const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserReview = new Schema({
    review_id: {
        type: String
    },
    reviewer_id: {
        type: String
    },
    game_id: {
        type: Number
    },
    recommended: {
        type: Boolean
    },
    review_text: {
        type: String
    },
    language: {
        type: String
    },
    creation_timestamp: {
        type: Date
    },
    most_recent_update_timestamp: {
        type: Date
    },
    helpful_votes: {
        type: Number
    },
    reviewer_playtime: {
        type: Number
    }
});

module.exports = mongoose.model('reviews', UserReview);