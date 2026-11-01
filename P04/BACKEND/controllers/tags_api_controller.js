const fs = require('fs');
const Tag = require('../models/tag.js');

function getAuthenticatedUser(req) {
    let users = JSON.parse(fs.readFileSync('./database/users.json'));
    let authHeader = req.headers['x-auth'];
    if (!authHeader) return null;
    return users.find(u => u.password === authHeader) || null;
}

exports.authTagsMiddleware = (req, res, next) => {
    try {
        let authUser = getAuthenticatedUser(req);
        if (!authUser) {
            return res.status(401).send("Unauthorized");
        }
        let tags = JSON.parse(fs.readFileSync('./database/tags.json'));
        let id_tag = parseInt(req.params.id);
        let tag = tags.find(t => t.id === id_tag);
        if (!tag) {
            return res.status(404).send("Tag not found");
        }
        if (Number(tag.id_user) !== Number(authUser.id)) {
            return res.status(401).send("Unauthorized");
        }
        req.tag = tag;
        req.authUser = authUser;
        next();
    } catch (err) {
        res.status(400).send(err.message);
    }
};

exports.createTag = (req, res) => {
    try {
        let authUser = getAuthenticatedUser(req);
        if (!authUser) {
            return res.status(401).send("Unauthorized");
        }
        const { name, color } = req.body;
        let newTag = new Tag(name, color, authUser.id);
        let tags = JSON.parse(fs.readFileSync('./database/tags.json'));
        tags.push(newTag.toObj());
        fs.writeFileSync('./database/tags.json', JSON.stringify(tags, null, 2));
        res.status(201).json(newTag.toObj());
    } catch (err) {
        res.status(400).send(err.errorMessage || err.message);
    }
};
exports.getTags = (req, res) => {
    try {
        let authUser = getAuthenticatedUser(req);
        if (!authUser) {
            return res.status(401).send("Unauthorized");
        }
        let tags = JSON.parse(fs.readFileSync('./database/tags.json'));
        let userTags = tags.filter(t => t.id_user === authUser.id);
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || userTags.length;
        let startIndex = (page - 1) * limit;
        let endIndex = startIndex + limit;
        let paginatedTags = userTags.slice(startIndex, endIndex);
        res.json({
            page: page,
            next_page: page + 1,
            limit: limit,
            total: userTags.length,
            data: paginatedTags
        });
    } catch (err) {
        res.status(400).send(err.message);
    }
};

exports.getTag = (req, res) => {
    res.json(req.tag);
};

exports.updateTag = (req, res) => {
    try {
        const { name, color } = req.body;
        if (!name && !color) {
            return res.status(400).send("Debes enviar al menos un campo para actualizar");
        }
        let tags = JSON.parse(fs.readFileSync('./database/tags.json'));
        let index = tags.findIndex(t => t.id === req.tag.id);
        if (name) tags[index].name = name;
        if (color) tags[index].color = color;
        fs.writeFileSync('./database/tags.json', JSON.stringify(tags, null, 2));
        res.json({ message: "Tag updated!", tag: tags[index] });
    } catch (err) {
        res.status(400).send(err.message);
    }
};

exports.deleteTag = (req, res) => {
    try {
        let tasks = JSON.parse(fs.readFileSync('./database/tasks.json'));
        let isTagInUse = tasks.some(task => Array.isArray(task.tags) && (task.tags.includes(req.tag.name) || task.tags.includes(req.tag.id)));
        if (isTagInUse) {
            return res.status(400).send("No se puede eliminar la etiqueta porque está asignada a una tarea.");
        }
        let tags = JSON.parse(fs.readFileSync('./database/tags.json'));
        let index = tags.findIndex(t => t.id === req.tag.id);
        let deletedTag = tags.splice(index, 1);
        fs.writeFileSync('./database/tags.json', JSON.stringify(tags, null, 2));
        res.json({ message: `Tag with id ${req.tag.id} deleted!`, tag: deletedTag });
    } catch (err) {
        res.status(400).send(err.message);
    }
};