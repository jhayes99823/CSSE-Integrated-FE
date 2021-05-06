const express = require('express');
const router = express.Router();

const mongoRoutes = require('./mongo');
const redisRoutes = require('./redis');

router.get("/", (req, res) => {
    res.json({
        message:
            "CSSE 433 Backend API",
    });
});

router.use("/mongo", mongoRoutes);
router.use("/redis", redisRoutes);

module.exports = router;