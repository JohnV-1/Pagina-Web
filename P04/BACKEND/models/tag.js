const fs = require('fs');

function getNextTagID() {
    let tags = JSON.parse(fs.readFileSync('./database/tags.json'));
    return tags.length + 1;
}

class TagException {
    constructor(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

class Tag {
    #id;
    #name;
    #color;
    #id_user;

    constructor(name, color, id_user) {
        this.#id = getNextTagID();
        this.name = name;
        this.color = color;
        this.id_user = id_user;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        throw new TagException("Ta mal el Id se genera solo");
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        if (!value || value.trim() === "") {
            throw new TagException("El nombre no puede estar vacio");
        } else {
            this.#name = value;
        }
    }

    get color() {
        return this.#color;
    }

    set color(valor) {
        const regex = /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
        if (regex.test(valor)) {
            this.#color = valor;
        } else {
            throw new TagException("El valor del color es invalido");
        }
    }

    get id_user() {
        return this.#id_user;
    }

    set id_user(value) {
        let users = JSON.parse(fs.readFileSync('./database/users.json'));
        if (users.findIndex(item => item.id == value) !== -1) {
            this.#id_user = value;
        } else {
            throw new TagException("El ID de usuario asignado no existe.");
        }
    }

    toObj() {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            id_user: this.id_user
        };
    }
}

module.exports = Tag;