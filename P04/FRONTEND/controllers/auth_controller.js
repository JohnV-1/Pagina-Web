

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
        .then(response => {
            if (!response.ok) alert("las contraseñas no coinciden");
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
document.getElementById('formLogin').addEventListener('submit', login);
document.getElementById('formRegister').addEventListener('submit', register);