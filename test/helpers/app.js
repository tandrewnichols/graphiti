const bodyParser = require('body-parser');
const http = require('http');
const chalk = require('chalk');
const express = require('express');
const app = express();
const server = module.exports = http.createServer(app);

app.set('port', 7400);
app.use(bodyParser.json());

app.get('/', (req, res, next) => res.status(200).end());

server.listen(app.get('port'), () => console.log(chalk.cyan('Fake neo4j server listening on 7400')));
