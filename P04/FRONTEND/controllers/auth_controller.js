// ===================== LOGIN / REGISTRO =====================

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

function login(event) {
    event.preventDefault();
    let data = new FormData(event.target);

    fetch(local_url + 'login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data.entries()))
    })
        .then(response => {
            if (!response.ok) {
                alert("Correo y/o contraseña incorrectos");
                return null; // el 401 no trae JSON, no intentamos parsearlo
            }
            return response.json();
        })
        .then(user => {
            if (!user) return;
            sessionStorage.setItem('user', JSON.stringify(user));
            window.location.href = local_url + 'home.html';
        })
        .catch(err => console.error("Error en login: ", err));
}

function register(event) {
    event.preventDefault();
    let data = new FormData(event.target);

    fetch(local_url + 'users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data.entries()))
    })
        .then(async response => {
            if (!response.ok) {
                alert(await response.text() || "No se pudo crear el usuario");
                return null;
            }
            return response.json();
        })
        .then(user => {
            if (!user) return;
            sessionStorage.setItem('user', JSON.stringify(user));
            window.location.href = local_url + 'home.html';
        })
        .catch(err => console.error("Error en registro: ", err));
}

function logout() {
    sessionStorage.clear();
    window.location.href = local_url;
}

// ===================== EDITAR / ELIMINAR USUARIO =====================

function populateModal() {
    let user = getCurrentUser();
    document.getElementById('name_field').value = user.name;
    document.getElementById('email_field').value = user.email;
    document.getElementById('password_field').value = user.password;
}

function updateUser(event) {
    event.preventDefault();
    let user = getCurrentUser(),
        data = new FormData(event.target);

    fetch(local_url + 'users/' + user.id, {
        method: 'PATCH',
        headers: authHeaders(true),
        body: JSON.stringify(Object.fromEntries(data.entries()))
    })
        .then(async response => {
            if (!response.ok) {
                alert(await response.text() || "No se pudo actualizar el usuario");
                return null;
            }
            return response.json();
        })
        .then(res => {
            if (!res) return;
            sessionStorage.setItem('user', JSON.stringify(res.user || res));
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEdit')).hide();
            alert("Usuario actualizado correctamente");
            init();
        })
        .catch(err => console.error("Error al actualizar usuario: ", err));
}

function deleteUser() {
    let user = getCurrentUser();

    fetch(local_url + 'users/' + user.id, {
        method: 'DELETE',
        headers: authHeaders(false)
    })
        .then(async response => {
            if (!response.ok) {
                alert(await response.text() || "No se pudo eliminar el usuario");
                return;
            }
            alert("Usuario eliminado");
            // Sin esto, validateLogin nos regresaria a home con un usuario que ya no existe
            sessionStorage.clear();
            window.location.href = local_url;
        })
        .catch(err => console.error("Error al eliminar usuario: ", err));
}

// ===================== INIT =====================
// Se ejecuta al entrar a cualquier pagina y despues de cada cambio (crear/editar/eliminar).
async function init() {
    if (!sessionStorage.user) return;
    let user = getCurrentUser();

    // El widget del nombre solo existe en home
    let userNameWidget = document.getElementById('userNameWidget');
    if (userNameWidget) userNameWidget.innerText = user.name;

    // Primero las etiquetas (las tareas las necesitan para pintar nombre y color)
    if (typeof loadTags === 'function') await loadTags();
    if (typeof loadTasks === 'function') loadTasks();
}

document.addEventListener('DOMContentLoaded', () => {
    let formLogin = document.getElementById('formLogin'),
        formRegister = document.getElementById('formRegister'),
        modalEdit = document.getElementById('modalEdit'),
        formEditUser = document.getElementById('formEditUser'),
        btnConfirmDeleteUser = document.getElementById('btnConfirmDeleteUser');

    // Cada pagina tiene distintos elementos: validar que existan antes del listener
    if (formLogin) formLogin.addEventListener('submit', login);
    if (formRegister) formRegister.addEventListener('submit', register);
    // show.bs.modal (antes de que se vea) para que los campos ya esten llenos al abrir
    if (modalEdit) modalEdit.addEventListener('show.bs.modal', populateModal);
    if (formEditUser) formEditUser.addEventListener('submit', updateUser);
    if (btnConfirmDeleteUser) btnConfirmDeleteUser.addEventListener('click', deleteUser);

    init();
});
