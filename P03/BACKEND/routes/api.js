const express = require('express');
const path = require('path');

const routerApi = express.Router();

//Middleware
function verificacion(req, res, next) {
    if (req.get("x-auth")) {
        next();
    } else {
        res.sendStatus(401);
    }
}

routerApi.get('/home.html', verificacion);
routerApi.get('/tasks.html', verificacion);


routerApi.get('/', (req, res) => {
    if (req.get("x-auth")) {
        res.sendFile(path.resolve(__dirname + "/../../FRONTED/views/P01_home.html"));
    } else {
        res.sendFile(path.resolve(__dirname + "/../../FRONTED/views/P01_login.html"))
    }
});
routerApi.get('/home.html', (req, res) => res.sendFile(path.resolve(__dirname + "/../../FRONTED/views/P01_home.html")));
routerApi.get('/login.html', (req, res) => res.sendFile(path.resolve(__dirname + "/../../FRONTED/views/P01_login.html")));
routerApi.get('/tasks.html', (req, res) => res.sendFile(path.resolve(__dirname + "/../../FRONTED/views/P01_tasks.html")));

module.exports = routerApi;
