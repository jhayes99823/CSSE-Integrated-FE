const express = require('express');
const router = express.Router();

const mongoRoutes = require('./mongo');
const redisRoutes = require('./redis');
const orientRoutes = require('./orient');

router.get("/", (req, res) => {
    res.json({
        message:
            "CSSE 433 Backend API",
    });
});

router.use("/mongo", mongoRoutes);
router.use("/redis", redisRoutes);
router.use("/orient", orientRoutes);

module.exports = router;