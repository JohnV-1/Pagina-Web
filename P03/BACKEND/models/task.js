function getNextTaskID() {
    return data.tasks.length
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
    #owner;
    #status;
    #tags;
    constructor(title, due_date, owner, status, tags) {
        this.#id = getNextTaskID();
        this.title = title;
        this.due_date = due_date;
        this.owner = owner;
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
    get owner() {
        return this.#owner;
    }
    get static() {
        return this.#status;
    }
    get tags() {
        return this.#tags;
    }
    set id(value) {
        throw new TagException("Ta mal el Id se genera solo")
    }
    set title(value) {
        if (value == "") {
            throw new TagException("El titulo no puede estar vacio")
        } else {
            this.#title = value;
        }
    }
    set due_date(value) {
        const fecha = new Date(value);
        if (!isNaN(fecha.getTime())) {
            this.#due_date = value;
        } else {
            throw new TagException("El formato de fecha debe ser aceptado por new Date()")
        }
    }
    set owner(value) {

        if (data.users.findIndex(item => item.id == value) !== -1) {
            this.#owner = value;
        } else {
            throw new UserException("El ID de usuario asignado como owner no existe.");
        }
    }
    set status(value) {
        if (value == "A" || value == "F" || value == "C") {
            this.#status = value;
        } else {
            throw new TagException("El formato debe de se A/F/C")

        }
    }
    set tags(value) {
        if (Array.isArray(value)) {
            this.#tags = value;
        } else {
            throw new TagException("El tag debe de ser un arreglo")

        }
    }
}
console.log("Todo jalando al 100 viejon desde task")