// require packages, set port
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./app/routes');
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const port = 3002;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

routes(app, {});

const server = app.listen(port, (err) => {
    if (err) return console.log(`Error: ${err}`);

    console.log(`Live on port ${server.address().port}`);
});
