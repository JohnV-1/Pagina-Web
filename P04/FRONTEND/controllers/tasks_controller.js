let pageToday = 1;
let pageByTag = 1;
let pageFinished = 1;
let pageTasksMain = 1;
let selectedTagIdHome = null;
let selectedTagIdTasks = null;

function crearTarea() {
    event.preventDefault();
    let data = new FormData(event.target);
    let payload = Object.fromEntries(data.entries());
    if (payload.tag && payload.tag !== "") {
        payload.tags = [parseInt(payload.tag)];
    } else {
        payload.tags = [];
    }
    delete payload.tag;
    fetch(local_url + 'tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth': JSON.parse(sessionStorage.user).password
        },
        body: JSON.stringify(payload)
    })
    .then(async response => {
        if (!response.ok) {
            let errorText = await response.text();
            alert(errorText || "Error al crear la tarea");
            return null;
        }
        return response.json();
    })
    .then(task => {
        if (task) {
            alert("Tarea creada con éxito");
            event.target.reset();
            let modalElement = document.getElementById('modalTarea');
            if (modalElement && window.bootstrap) {
                let modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) modalInstance.hide();
            }
            init();
        }
    })
    .catch(err => {
        console.log("Aquí tronó");
        console.error("Error al crear tarea: ", err);
    });
}

function toggleTaskStatus(idTask, currentStatus) {
    fetch(local_url + 'tasks/' + idTask, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth': JSON.parse(sessionStorage.user).password
        },
        body: JSON.stringify({ status: !currentStatus })
    })
    .then(response => {
        if (response.ok) init();
    })
    .catch(err => console.error("Error al cambiar estatus: ", err));
}

function eliminarTarea(idTask) {
    if (!confirm("¿Desea eliminar esta tarea?")) return;
    fetch(local_url + 'tasks/' + idTask, {
        method: 'DELETE',
        headers: {
            'x-auth': JSON.parse(sessionStorage.user).password
        }
    })
    .then(response => {
        if (response.ok) {
            alert("Tarea eliminada con éxito");
            init();
        }
    })
    .catch(err => console.error("Error al eliminar tarea: ", err));
}

function populateTaskTagSelect() {
    if (!sessionStorage.user) return;
    fetch(local_url + 'tags?page=1&limit=200', {
        headers: {
            'x-auth': JSON.parse(sessionStorage.user).password
        }
    })
    .then(res => res.json())
    .then(data => {
        let tags = data.data || [];
        let selects = document.querySelectorAll('select[name="tag"]');
        selects.forEach(select => {
            select.innerHTML = '<option value="">Sin Etiqueta</option>';
            tags.forEach(tag => {
                let opt = document.createElement('option');
                opt.value = tag.id;
                opt.innerText = tag.name;
                select.appendChild(opt);
            });
        });
    });
}

function renderHomeWidgets() {
    let userNameWidget = document.getElementById('userNameWidget');
    if (!userNameWidget) return;

    fetch(local_url + 'tasks?page=1&limit=500', {
        headers: {
            'x-auth': JSON.parse(sessionStorage.user).password
        }
    })
    .then(res => res.json())
    .then(resData => {
        let allTasks = resData.data || [];
        let todayStr = new Date().toISOString().split('T')[0];
        let finishedToday = allTasks.filter(t => t.status && t.due_date && t.due_date.includes(todayStr)).length;
        let pendingToday = allTasks.filter(t => !t.status && t.due_date && t.due_date.includes(todayStr)).length;
        let textFinished = document.querySelector('#userNameWidget ~ strong:nth-of-type(1)');
        let textPending = document.querySelector('#userNameWidget ~ strong:nth-of-type(2)');
        if (textFinished) textFinished.innerText = "Tareas terminadas hoy: " + finishedToday;
        if (textPending) textPending.innerText = "Tareas pendientes de hoy: " + pendingToday;
    });

    fetch(local_url + 'tasks?page=' + pageToday + '&limit=3', {
        headers: {
            'x-auth': JSON.parse(sessionStorage.user).password
        }
    })
    .then(res => res.json())
    .then(resData => {
        let container = document.querySelector('.table-primary tbody');
        if (!container) return;
        container.innerHTML = '';
        let tasks = (resData.data || []).filter(t => !t.status);
        if (tasks.length === 0) {
            container.innerHTML = '<tr><td colspan="3" class="text-center">Sin tareas por ahora</td></tr>';
        } else {
            tasks.forEach(t => {
                let tr = document.createElement('tr');
                tr.innerHTML = `<td>${t.title}</td><td>Etiqueta</td><td>${t.due_date || 'N/A'}</td>`;
                container.appendChild(tr);
            });
        }
    });

    fetch(local_url + 'tasks?page=' + pageByTag + '&limit=3', {
        headers: {
            'x-auth': JSON.parse(sessionStorage.user).password
        }
    })
    .then(res => res.json())
    .then(resData => {
        let container = document.querySelector('.table-warning tbody');
        if (!container) return;
        container.innerHTML = '';
        let tasks = (resData.data || []).filter(t => !t.status);
        if (selectedTagIdHome) {
            tasks = tasks.filter(t => t.tags && t.tags.includes(selectedTagIdHome));
        }
        if (tasks.length === 0) {
            container.innerHTML = '<tr><td colspan="3" class="text-center">Sin tareas por mostrar</td></tr>';
        } else {
            tasks.forEach(t => {
                let tr = document.createElement('tr');
                tr.innerHTML = `<td>${t.title}</td><td>Etiqueta</td><td>${t.due_date || 'N/A'}</td>`;
                container.appendChild(tr);
            });
        }
    });

    fetch(local_url + 'tasks?page=' + pageFinished + '&limit=3', {
        headers: {
            'x-auth': JSON.parse(sessionStorage.user).password
        }
    })
    .then(res => res.json())
    .then(resData => {
        let container = document.querySelector('.table-Dark tbody, .table-dark tbody');
        if (!container) return;
        container.innerHTML = '';
        let tasks = (resData.data || []).filter(t => t.status);
        if (tasks.length === 0) {
            container.innerHTML = '<tr><td colspan="3" class="text-center">Sin tareas terminadas</td></tr>';
        } else {
            tasks.forEach(t => {
                let tr = document.createElement('tr');
                tr.innerHTML = `<td>${t.title}</td><td>Etiqueta</td><td>${t.due_date || 'N/A'}</td>`;
                container.appendChild(tr);
            });
        }
    });
}

function renderTasksPage() {
    let mainTable = document.querySelector('.table-striped tbody');
    if (!mainTable) return;

    fetch(local_url + 'tasks?page=' + pageTasksMain + '&limit=10', {
        headers: {
            'x-auth': JSON.parse(sessionStorage.user).password
        }
    })
    .then(res => res.json())
    .then(resData => {
        mainTable.innerHTML = '';
        let tasks = resData.data || [];
        if (tasks.length === 0) {
            mainTable.innerHTML = '<tr><td colspan="4" class="text-center">No hay tareas disponibles</td></tr>';
            return;
        }
        tasks.forEach(t => {
            let tr = document.createElement('tr');
            tr.innerHTML = `<td>${t.status ? '<del>' + t.title + '</del>' : t.title}</td><td>Etiqueta</td><td>${t.due_date || 'N/A'}</td><td>Acciones</td>`;
            mainTable.appendChild(tr);
        });
    });
}

function editarTareaPrompt(idTask, tituloActual) {
    let nuevoTitulo = prompt("Editar título de la tarea:", tituloActual);
    if (!nuevoTitulo) return;
    fetch(local_url + 'tasks/' + idTask, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth': JSON.parse(sessionStorage.user).password
        },
        body: JSON.stringify({ title: nuevoTitulo })
    })
    .then(res => {
        if (res.ok) {
            alert("Tarea actualizada con éxito");
            init();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    let formTarea = document.querySelector('#modalTarea form');
    if (formTarea) {
        formTarea.addEventListener('submit', crearTarea);
    }
});