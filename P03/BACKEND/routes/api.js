const express = require('express');
const path = require('path');

const routerApi = express.Router();

routerApi.get('/', (req, res) => res.sendFile(path.resolve(__dirname + "/../../FRONTED/views/P01_login.html")));
routerApi.get('/home.html', (req, res) => res.sendFile(path.resolve(__dirname + "/../../FRONTED/views/P01_home.html")));
routerApi.get('/login.html', (req, res) => res.sendFile(path.resolve(__dirname + "/../../FRONTED/views/P01_login.html")));
routerApi.get('/tasks.html', (req, res) => res.sendFile(path.resolve(__dirname + "/../../FRONTED/views/P01_tasks.html")));

module.exports = routerApi;
