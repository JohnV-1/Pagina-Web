function getNextTagID() {
    return data.tags.length
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
    constructor(name, color) {
        this.#id = getNextTagID();
        this.name = name;
        this.color = color;
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
        if (value == "") {
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
            console.log("No jalo")
            throw new TagException("El valor del color es invalido");

        }
    }
}