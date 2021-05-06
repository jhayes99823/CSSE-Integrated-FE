const ops = require('../mongo/ops');
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    ops.getAllReviews().then((result) => {
        console.log('made it here,   ', result);
    }).then(() => {
        res.end();
    })
});

module.exports = router;