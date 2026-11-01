const express = require('express');
const path = require('path');

const usersController = require('../controllers/users_api_controller.js');

const routerUsers = express.Router();


routerUsers.post('/', usersController.registerUser);

routerUsers.get('/', usersController.getUsers);
routerUsers.use('/:id', usersController.autenticarMiddleware);
routerUsers.get('/:id', usersController.getUser);

routerUsers.patch('/:id', usersController.updateUser);
routerUsers.delete('/:id', usersController.deleteUser);

module.exports = routerUsers;