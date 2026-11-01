const express = require('express');
const routerTasks = express.Router();
const tasksController = require('../controllers/tasks_api_controller.js');

routerTasks.post('/', tasksController.createTask);
routerTasks.get('/', tasksController.getTasks);

routerTasks.use('/:id', tasksController.authTasksMiddleware);

routerTasks.get('/:id', tasksController.getTask);
routerTasks.patch('/:id', tasksController.updateTask);
routerTasks.delete('/:id', tasksController.deleteTask);

module.exports = routerTasks;