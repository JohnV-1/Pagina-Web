const express = require('express');
const path = require('path');

const usersController=require('../controllers/users_api_controller.js');

const routerUsers = express.Router();


routerUsers.post('/',usersController.registerUser);

routerUsers.get('/', usersController.getUsers);

module.exports = routerUsers;