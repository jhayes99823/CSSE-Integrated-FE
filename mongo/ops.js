let Reviews = require('./userReview.model');

async function getAllReviews() {
    let reviews = await Reviews.find({});

    //console.log(reviews);

    return reviews;
}

module.exports = {
    getAllReviews
}