function getNextUserID() {
    return data.users.length
}
class UserException {
    constructor(errorMessage) {
        this.errorMessage = errorMessage;
    }
}
class User {
    #id;
    #name;
    #email;
    #password;
    #joined_at;
    constructor(name, email, password) {
        this.#id = getNextUserID();
        this.name = name;
        this.email = email;
        this.password = password;
        this.#joined_at = new Date();
    }
    get id() {
        return this.#id;
    }
    get name() {
        return this.#name;
    }
    get email() {
        return this.#email;
    }
    get password() {
        return this.#password;
    }
    get joined_at() {
        return this.#joined_at;
    }
    set id(value) {
        throw new UserException("Ta mal el Id se genera solo")
    }
    set name(value) {
        if (value == "") {
            throw new UserException("El nombre no puede estar vacio")
        } else {
            this.#name = value;
        }
    }
    set email(value) {
        if (value == "") {
            throw new UserException("El email no puede estar vacio")
        } else {
            //this.#email = value;

            if (data.users.findIndex(item => item.email == value) == -1) {
                this.#email = value;
            } else {
                throw new UserException("El email no se puede repetir")

            }
        }
    }
    set password(value) {
        let str = "" + value
        if (value == "" || str.length < 8) {
            throw new UserException("La contraseña no puede estar vacia y debe de tener al menos 8 caracteres")
        } else {
            this.#password = value;
        }
    }
    set joined_at(value) {
        throw new UserException("No se puede modificar este se genera con la fecha actual")
    }
}
