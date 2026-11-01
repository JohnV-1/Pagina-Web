const fs = require('fs');
let users = JSON.parse(fs.readFileSync('./database/users.json'));

const User = require('../models/user.js');

//Autenticar usuario
exports.autenticarMiddleware = (req, res, next) => {
    try {
        let users = JSON.parse(fs.readFileSync('./database/users.json'));
        let id_user = parseInt(req.params.id);

        let user = users.find(u => u.id === id_user);
        if (!user) {
            return res.status(404).send("Usuario no encontrado");
        }
        let authHeader = req.headers['x-auth'];
        if (!authHeader || authHeader !== user.password) {
            return res.status(401).send("Contraseña incorrecta");
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(400).send(err.message);
    }
}
// GET usuario
exports.getUser = (req, res) => {
    res.json(req.user);
};
//PATCH 
exports.updateUser = (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name && !email && !password) {
            return res.status(400).send("Debes enviar al menos un campo");
        }
        let users = JSON.parse(fs.readFileSync('./database/users.json'));
        let id_user = parseInt(req.params.id);
        let index = users.findIndex(u => u.id === id_user);
        if (name) users[index].name = name;
        if (email) users[index].email = email;
        if (password) users[index].password = password;
        fs.writeFileSync('./database/users.json', JSON.stringify(users, null, 2));
        res.json({
            message: "User updated!",
            user: users[index]
        });
    } catch (err) {
        res.status(400).send(err.message);
    }
};
// DELETE 
exports.deleteUser = (req, res) => {
    try {
        let users = JSON.parse(fs.readFileSync('./database/users.json'));
        let id_user = parseInt(req.params.id);
        let index = users.findIndex(u => u.id === id_user);
        let deletedUser = users.splice(index, 1);
        fs.writeFileSync('./database/users.json', JSON.stringify(users, null, 2));
        res.json({
            message: 'Usuario con id: '+id_user+' eliminado',
            user: deletedUser
        });
    } catch (err) {
        res.status(400).send(err.message);
    }
};



exports.registerUser = (req, res) => {
    try {
        if (req.body.password != req.body.confirm_password) {
            res.status(400).send("Las contraseñas no coinciden");
        } else {
            let new_user = new User(req.body.name, req.body.email, req.body.password);
            users.push(new_user.toObj());
            fs.writeFileSync('./database/users.json', JSON.stringify(users, null, 2));
            res.send("Usuarios agregado");
        }
    } catch (err) {
        res.status(400).send(err.errorMessage);
    }
}

exports.getUsers = (req, res) => {
    if (req.headers['x-auth'] !== 'admin_auth') {
        return res.status(401).send("Unauthorized");
    }
    try {
        let page = parseInt(req.query.page)
        let limit = parseInt(req.query.limit)
        let startIndex = (page - 1) * limit;
        let endIndex = startIndex + limit;
        let paginatedUsers = users.slice(startIndex, endIndex);
        res.json({ page: page, next_page: page + 1, limit: limit, total: users.length, data: paginatedUsers });
    } catch (err) {
        res.status(400).send(err.message);
    }
}