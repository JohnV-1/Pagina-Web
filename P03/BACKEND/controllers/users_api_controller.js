const fs = require('fs');
let users = JSON.parse(fs.readFileSync('./database/users.json'));

const User = require('../models/user.js');

//register function:
exports.registerUser = (req, res) => {
    try {
        if (req.body.password != req.body.confirm_password) {
            res.status(400).send("Password Incorrecta");
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