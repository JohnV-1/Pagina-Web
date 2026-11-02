

function toggleForms() {
    let form_login = document.getElementById('formLogin'),
        form_register = document.getElementById('formRegister');

    if (form_register.style.display == 'none') {
        form_login.style.display = 'none';
        form_register.style.display = 'block';
    }
    else {
        form_login.style.display = 'block';
        form_register.style.display = 'none';
    }
}
console.log("Todoa ta jalando al 100% viejon");
function login() {
    event.preventDefault();
    let data = new FormData(event.target);

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(data.entries()))
    })
        .then(response => {
            if (!response.ok) alert("Correo y/o contraseña incorrectos");
            return response.json();
        })
        .then(user => {
            sessionStorage.setItem('user', JSON.stringify(user));
            window.location.href = local_url + 'home.html';
        })
        .catch(err => {
            console.log("Aqui trono");
            console.error("Error de login: ", err);
        })
}


function logout() {
    sessionStorage.clear();
    window.location.href = local_url;
}
function register() {
    event.preventDefault();
    let data = new FormData(event.target);

    fetch('/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(data.entries()))
    })
        // .then(response => {
        //     if (!response.ok) alert("hOLA");
        //     return response.json();
        // })
        .then(async response => {
            if (!response.ok) {
                let errrorText = await response.text();
                alert(errrorText);
                return response.json();
            }
            return response.json();
        })
        .then(user => {
            sessionStorage.setItem('user', JSON.stringify(user));
            window.location.href = local_url + 'home.html';
        })
        .catch(err => {
            console.log("Aqui trono");
            console.error("Error de login: ", err);
        })
}


document.addEventListener("DOMContentLoaded", () => {
    let formRegister = document.getElementById('formRegister');
    let formLogin = document.getElementById('formLogin');
    // Verificar si existen los formularios en la página actual antes de agregar eventos 
    if (formRegister) {
        formRegister.addEventListener('submit', register);
    }
    if (formLogin) {
        formLogin.addEventListener('submit', login);
    }


});
