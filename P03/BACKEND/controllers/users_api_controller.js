const fs = require('fs');
let users = JSON.parse(fs.readFileSync('./database/users.json'));

const User = require('../models/user.js');

//register function:
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