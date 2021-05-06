const express = require('express');
const router = express.Router();

const mongoRoutes = require('./mongo');
// import pileRoutes from "./pile";
// import playerRoutes from "./player";

router.get("/", (req, res) => {
    res.json({
        message:
            "CSSE 433 Backend API",
    });
});

router.use("/mongo", mongoRoutes);
// router.use("/pile", pileRoutes);
// router.use("/player", playerRoutes);

module.exports = router;