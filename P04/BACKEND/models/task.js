const fs = require('fs');

function getNextTaskID() {
    let tasks = JSON.parse(fs.readFileSync('./database/tasks.json'));
    return tasks.length + 1;
}

class TaskException {
    constructor(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

class Task {
    #id;
    #title;
    #due_date;
    #id_user;
    #status;
    #tags;

    constructor(title, due_date, id_user, status, tags) {
        this.#id = getNextTaskID();
        this.title = title;
        this.due_date = due_date;
        this.id_user = id_user;
        this.status = status;
        this.tags = tags;
    }

    get id() {
        return this.#id;
    }
    get title() {
        return this.#title;
    }
    get due_date() {
        return this.#due_date;
    }
    get id_user() {
        return this.#id_user;
    }
    get status() {
        return this.#status;
    }
    get tags() {
        return this.#tags;
    }

    set id(value) {
        throw new TaskException("El ID se genera automáticamente");
    }

    set title(value) {
        if (!value || value.trim() === "") {
            throw new TaskException("El título no puede estar vacío");
        }
        this.#title = value;
    }

    set due_date(value) {
        const fecha = new Date(value);
        if (!isNaN(fecha.getTime())) {
            this.#due_date = value;
        } else {
            throw new TaskException("El formato de fecha debe ser aceptado por new Date()");
        }
    }

    set id_user(value) {
        let users = JSON.parse(fs.readFileSync('./database/users.json'));
        if (users.findIndex(item => item.id == value) !== -1) {
            this.#id_user = value;
        } else {
            throw new TaskException("El ID de usuario asignado como owner no existe.");
        }
    }

    set status(value) {
        if (value === "A" || value === "F" || value === "C") {
            this.#status = value;
        } else {
            throw new TaskException("El formato de estatus debe ser A/F/C");
        }
    }

    set tags(value) {
        if (Array.isArray(value)) {
            this.#tags = value;
        } else {
            throw new TaskException("El tag debe de ser un arreglo");
        }
    }

    toObj() {
        return {
            id: this.id,
            title: this.title,
            due_date: this.due_date,
            status: this.status,
            tags: this.tags,
            id_user: this.id_user
        };
    }
}

module.exports = Task;