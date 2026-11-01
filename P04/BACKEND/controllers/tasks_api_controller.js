const fs = require('fs');
const Task = require('../models/task.js');

function getAuthenticatedUser(req) {
    let users = JSON.parse(fs.readFileSync('./database/users.json'));
    let authHeader = req.headers['x-auth'];
    if (!authHeader) return null;
    return users.find(u => u.password === authHeader) || null;
}

exports.authTasksMiddleware = (req, res, next) => {
    try {
        let authUser = getAuthenticatedUser(req);
        if (!authUser) {
            return res.status(401).send("Unauthorized");
        }
        let tasks = JSON.parse(fs.readFileSync('./database/tasks.json'));
        let id_task = parseInt(req.params.id);
        let task = tasks.find(t => t.id === id_task);
        if (!task) {
            return res.status(404).send("Task not found");
        }
        if (task.id_user !== authUser.id) {
            return res.status(401).send("Unauthorized");
        }
        req.task = task;
        req.authUser = authUser;
        next();
    } catch (err) {
        res.status(400).send(err.message);
    }
};

exports.createTask = (req, res) => {
    try {
        let authUser = getAuthenticatedUser(req);
        if (!authUser) {
            return res.status(401).send("Unauthorized");
        }
        const { title, due_date, status, tags } = req.body;
        let newTask = new Task(title, due_date, authUser.id, status, tags);
        let tasks = JSON.parse(fs.readFileSync('./database/tasks.json'));
        tasks.push(newTask.toObj());
        fs.writeFileSync('./database/tasks.json', JSON.stringify(tasks, null, 2));
        res.status(201).json(newTask.toObj());
    } catch (err) {
        res.status(400).send(err.errorMessage || err.message);
    }
};

exports.getTasks = (req, res) => {
    try {
        let authUser = getAuthenticatedUser(req);
        if (!authUser) {
            return res.status(401).send("Unauthorized");
        }
        let tasks = JSON.parse(fs.readFileSync('./database/tasks.json'));
        let userTasks = tasks.filter(t => t.id_user === authUser.id);
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || userTasks.length;
        let startIndex = (page - 1) * limit;
        let endIndex = startIndex + limit;
        let paginatedTasks = userTasks.slice(startIndex, endIndex);
        res.json({
            page: page,
            next_page: page + 1,
            limit: limit,
            total: userTasks.length,
            data: paginatedTasks
        });
    } catch (err) {
        res.status(400).send(err.message);
    }
};

exports.getTask = (req, res) => {
    res.json(req.task);
};

exports.updateTask = (req, res) => {
    try {
        const { title, due_date, status, tags, id_user } = req.body;
        if (!title && !due_date && !status && !tags && !id_user) {
            return res.status(400).send("Debes enviar al menos un campo para actualizar");
        }
        let tasks = JSON.parse(fs.readFileSync('./database/tasks.json'));
        let index = tasks.findIndex(t => t.id === req.task.id);
        if (title) tasks[index].title = title;
        if (due_date) tasks[index].due_date = due_date;
        if (status) tasks[index].status = status;
        if (tags) tasks[index].tags = tags;
        if (id_user) tasks[index].id_user = id_user;
        fs.writeFileSync('./database/tasks.json', JSON.stringify(tasks, null, 2));
        res.json({ message: "Task updated!", task: tasks[index] });
    } catch (err) {
        res.status(400).send(err.message);
    }
};

exports.deleteTask = (req, res) => {
    try {
        let tasks = JSON.parse(fs.readFileSync('./database/tasks.json'));
        let index = tasks.findIndex(t => t.id === req.task.id);
        let deletedTask = tasks.splice(index, 1);
        fs.writeFileSync('./database/tasks.json', JSON.stringify(tasks, null, 2));
        res.json({ message: `Task with id ${req.task.id} deleted!`, task: deletedTask });
    } catch (err) {
        res.status(400).send(err.message);
    }
};