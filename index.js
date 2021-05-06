const express = require('express');
const bodyParser = require('body-parser');
var app = express();
const PORT = 3100;

const router = require("./routes");

require('./mongo/index');

const logger = require('morgan');

app.use(logger('dev'));

app.use('/', express.static("public"));

app.use('/api/', bodyParser.urlencoded({ extended: true }));
app.use('/api/', bodyParser.json());
app.use("/api/", router);

app.listen(PORT, function () {
    console.log("Server is running on Port: " + PORT);
});