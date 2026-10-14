const express = require('express');
const path = require('path');

const routerApi = express.Router();

routerApi.get('/home.html',(req,res)=> res.sendFile(path.resolve(__dirname+"/../../FRONTED/views/P01_home.html")));

module.exports = routerApi;
