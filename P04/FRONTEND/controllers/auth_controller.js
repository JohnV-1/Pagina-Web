

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
function populateModal() {
    document.getElementById("nombre").value = JSON.parse(sessionStorage.user).name;
    document.getElementById("correo").value = JSON.parse(sessionStorage.user).email;
    document.getElementById("contrasena").value = JSON.parse(sessionStorage.user).password;
    console.log(JSON.parse(sessionStorage.user).id)
}
// function init() {
//     if (!sessionStorage.user) return;

//     const user = JSON.parse(sessionStorage.user);

//     const userNameDisplay = document.getElementById('userNameWidget');

//     if (userNameDisplay) {
//         userNameDisplay.innerText = user.name;
//     }
// }
function init() {
    if (!sessionStorage.user) return;
    let user = JSON.parse(sessionStorage.user);
    
    let userNameWidget = document.getElementById('userNameWidget');
    if (userNameWidget) {
        userNameWidget.innerText = user.name;
    }
    
    if (typeof loadTagsDropdown === 'function') {
        loadTagsDropdown();
    }
    
    if (typeof populateTaskTagSelect === 'function') {
        populateTaskTagSelect();
    }
    
    if (typeof renderHomeWidgets === 'function') {
        renderHomeWidgets();
    }
    
    if (typeof renderTasksPage === 'function') {
        renderTasksPage();
    }
}
function actualizar() {
    event.preventDefault();
    let data = new FormData(event.target);

    fetch('/users/' + JSON.parse(sessionStorage.user).id, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth': JSON.parse(sessionStorage.user).password
        },
        body: JSON.stringify(Object.fromEntries(data.entries()))
    })
        .then(async response => {
            if (!response.ok) {
                let errrorText = await response.text();
                alert(errrorText);
                return response.json();
            }
            return response.json();
        })
        .then(res => {
            if (res) {
                const updatedUser = res.user || res;
                sessionStorage.setItem('user', JSON.stringify(updatedUser));
                alert("Información de usuario actualizada correctamente");

                const modalElement = document.getElementById('edicion');
                if (modalElement && window.bootstrap) {
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) modalInstance.hide();
                }
                init();
            }
        })
        .catch(err => {
            console.log("Aqui trono");
            console.error("Error al actualizar: ", err);
        })
}
function eliminar() {
    fetch('/users/' + JSON.parse(sessionStorage.user).id, {
        method: 'DELETE',
        headers: {
            'x-auth': JSON.parse(sessionStorage.user).password
        }
    })
        .then(response => {
            if (!response.ok) alert("Fallo al eliminar");
            return response.json();
        })
        .then(data => {
            console.log('Usuario eliminado con éxito:', data);
            window.location.href = local_url;
        })
        .catch(error => {
            console.error('Error al eliminar:', error.message);
        })
}

document.addEventListener("DOMContentLoaded", () => {
    let formRegister = document.getElementById('formRegister');
    let formLogin = document.getElementById('formLogin');
    let formUpdate = document.getElementById('formUpdate');
    let modal = document.getElementById('edicion');
    // Verificar si existen los formularios en la página actual antes de agregar eventos 
    if (formRegister) {
        formRegister.addEventListener('submit', register);
    }
    if (formLogin) {
        formLogin.addEventListener('submit', login);
    }
    if (modal) {
        modal.addEventListener('shown.bs.modal', populateModal);
        formUpdate.addEventListener('submit', actualizar);
    }
    init();
});
