const dotenv = require('dotenv');
dotenv.config();
const constants = require('./common/constants');
const fs = require('fs')

try {
    fs.writeFileSync('./database_status.json', constants.DATABASE_STATUS_DEFAULT);
    console.log('Successfully wrote file')
} catch (err) {
    console.log('Error writing file', err)
}


const express = require('express');
const bodyParser = require('body-parser');
var app = express();
const PORT = process.env.WEBSITE_PORT;

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