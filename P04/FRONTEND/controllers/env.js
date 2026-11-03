const local_url = "http://localhost:3000/";

// Usuario actual guardado en sessionStorage (o null)
function getCurrentUser() {
    return sessionStorage.user ? JSON.parse(sessionStorage.user) : null;
}

// Headers con la autenticacion (x-auth = contraseña del usuario)
function authHeaders(withJson) {
    let headers = { 'x-auth': getCurrentUser().password };
    if (withJson) headers['Content-Type'] = 'application/json';
    return headers;
}

function validateLogin() {
    // Se compara el pathname para que funcione igual con "/" y con "/login.html"
    let path = window.location.pathname,
        isLoginPage = path === '/' || path.endsWith('/login.html');

    if (!sessionStorage.user && !isLoginPage) {
        alert("Favor de iniciar sesión");
        window.location.href = local_url;
    }
    if (sessionStorage.user && isLoginPage) {
        window.location.href = local_url + "home.html";
    }
}
validateLogin();
