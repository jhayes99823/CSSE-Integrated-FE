const mongoose = require('mongoose');
const server = '127.0.0.1:27017';       // REPLACE WITH YOUR DB SERVER
const database = 'steam_reviews';        // REPLACE WITH YOUR DB NAME
const dbURI = `mongodb://${server}/${database}`;

class Database {
    constructor() {
        this.connectToDB();
    }

    connectToDB() {
        mongoose.connect(dbURI, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
            /*  Use can add more options here.  See https://mongoosejs.com/docs/connections.html */
        }).then(() => {
            console.log('Database connection successful');
        }).catch(err => {
            console.error(`Database connection error: ${err}`);
        });
    }
}

module.exports = new Database();
