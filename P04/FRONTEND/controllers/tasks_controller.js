// Estado de paginas y filtros de cada vista
let pages = { today: 1, byTag: 1, finished: 1, tasks: 1 };
let selectedTagHome = null;   // widget "Tareas pendientes por etiqueta"
let selectedTagTasks = new URLSearchParams(window.location.search).get('tag'); // tasks.html?tag=ID
let taskToDelete = null;

// ===================== HELPERS =====================

// Fecha local de hoy en formato YYYY-MM-DD (igual que el input type="date")
function todayString() {
    let d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// "2026-11-03" -> "03/11/2026" (sin new Date para no mover el dia por zona horaria)
function formatDate(due_date) {
    let [y, m, d] = String(due_date || '').substring(0, 10).split('-');
    return d ? d + '/' + m + '/' + y : (due_date || '');
}

// GET de tareas SIEMPRE paginado y filtrado: { page, limit, status, date, tag }
async function readTasks(filters) {
    let params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') params.append(key, value);
    });
    let response = await fetch(local_url + 'tasks?' + params.toString(), { headers: authHeaders(false) });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

// ===================== RENDER GENERICO =====================

// Paginado dinamico. Si solo hay una pagina (o ninguna) no se muestra.
function renderPagination(container, current, total_pages, onPage) {
    container.innerHTML = '';
    if (total_pages <= 1) return;

    let addItem = (label, page, disabled, active) => {
        let li = document.createElement('li'),
            a = document.createElement('a');
        li.className = 'page-item' + (disabled ? ' disabled' : '') + (active ? ' active' : '');
        a.className = 'page-link';
        a.href = '#';
        a.innerHTML = label;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            if (!disabled && !active) onPage(page);
        });
        li.append(a);
        container.append(li);
    };

    addItem('&laquo;', current - 1, current === 1, false);
    for (let i = 1; i <= total_pages; i++) addItem(String(i), i, false, i === current);
    addItem('&raquo;', current + 1, current === total_pages, false);
}

// Fila de una tarea. withActions = true solo en tasks.html
function createTaskRow(task, withActions) {
    let tr = document.createElement('tr'),
        tdCheck = document.createElement('td'),
        tdTitle = document.createElement('td'),
        tdTag = document.createElement('td'),
        tdDate = document.createElement('td'),
        check = document.createElement('input'),
        finished = task.status === 'F';

    check.type = 'checkbox';
    check.checked = finished;
    check.addEventListener('change', () => updateTask(task.id, { status: check.checked ? 'F' : 'A' }));
    tdCheck.append(check);

    if (finished) {
        let del = document.createElement('del');
        del.innerText = task.title;
        tdTitle.append(del);
    } else {
        tdTitle.innerText = task.title;
    }

    let tag = Array.isArray(task.tags) && task.tags.length ? findTag(task.tags[0]) : null;
    if (tag) tdTag.append(createTagBadge(tag));
    else tdTag.innerHTML = '<span class="text-muted small">Sin etiqueta</span>';

    tdDate.innerText = formatDate(task.due_date);
    tr.append(tdCheck, tdTitle, tdTag, tdDate);

    if (withActions) {
        let tdActions = document.createElement('td'),
            pen = document.createElement('i'),
            trash = document.createElement('i');
        pen.className = 'fa-solid fa-pen';
        pen.title = 'Editar tarea';
        pen.style.cursor = 'pointer';
        pen.addEventListener('click', () => editTask(task));
        trash.className = 'fa-solid fa-trash';
        trash.title = 'Eliminar tarea';
        trash.style.cursor = 'pointer';
        trash.addEventListener('click', () => confirmDeleteTask(task));
        tdActions.append(pen, trash);
        tr.append(tdActions);
    }
    return tr;
}

/*
 * Pinta una tabla de tareas paginada.
 * prefix: prefijo de los IDs en el HTML (<prefix>Table, <prefix>Tbody, <prefix>Empty, <prefix>Pagination)
 * pageKey: llave en "pages"
 * filters: filtros para readTasks (sin page)
 */
async function renderTaskTable(prefix, pageKey, filters, limit, emptyText, withActions) {
    let table = document.getElementById(prefix + 'Table'),
        tbody = document.getElementById(prefix + 'Tbody'),
        empty = document.getElementById(prefix + 'Empty'),
        pagination = document.getElementById(prefix + 'Pagination');
    if (!tbody) return; // esta vista no existe en la pagina actual

    let res;
    try {
        res = await readTasks(Object.assign({ page: pages[pageKey], limit: limit }, filters));
        // Si la pagina actual se quedo vacia (ej. se completo la ultima tarea), ir a la ultima que exista
        if (res.data.length === 0 && pages[pageKey] > 1) {
            pages[pageKey] = Math.max(1, res.total_pages);
            res = await readTasks(Object.assign({ page: pages[pageKey], limit: limit }, filters));
        }
    } catch (err) {
        console.error("Error al cargar tareas: ", err);
        return;
    }

    tbody.innerHTML = '';
    if (res.data.length === 0) {
        table.classList.add('d-none');
        empty.innerText = emptyText;
        empty.classList.remove('d-none');
    } else {
        table.classList.remove('d-none');
        empty.classList.add('d-none');
        res.data.forEach(task => tbody.append(createTaskRow(task, withActions)));
    }

    renderPagination(pagination, pages[pageKey], res.total_pages, (page) => {
        pages[pageKey] = page;
        renderTaskTable(prefix, pageKey, filters, limit, emptyText, withActions);
    });
}

// Badges de etiquetas para filtrar (opacidad completa = seleccionada)
function renderTagFilters(container, selectedId, onSelect) {
    container.innerHTML = '';
    tagsCache.forEach(tag => {
        let badge = createTagBadge(tag);
        badge.classList.add('tag-filter', 'badgeT');
        if (Number(selectedId) === Number(tag.id)) badge.classList.add('active');
        badge.addEventListener('click', () => onSelect(tag.id));
        container.append(badge);
    });
}

// ===================== HOME: WIDGETS =====================

async function renderUserSummary() {
    let finishedEl = document.getElementById('finishedTodayWidget');
    if (!finishedEl) return;
    let today = todayString();
    try {
        // limit=1 porque aqui solo nos interesa el "total" de cada consulta filtrada
        let [finished, pending] = await Promise.all([
            readTasks({ page: 1, limit: 1, date: today, status: 'F' }),
            readTasks({ page: 1, limit: 1, date: today, status: 'A' })
        ]);
        let done = finished.total, left = pending.total, total = done + left,
            name = getCurrentUser().name;

        finishedEl.innerText = done + (done === 1 ? ' tarea' : ' tareas');
        document.getElementById('pendingTodayWidget').innerText = left + (left === 1 ? ' tarea' : ' tareas');

        let resume;
        if (total === 0) {
            resume = name + ' no tiene tareas programadas para hoy.';
        } else {
            let percent = Math.round(done * 100 / total);
            resume = name + ' es un usuario que ha terminado ' + done + (done === 1 ? ' tarea' : ' tareas') +
                ' hoy. Aún tiene ' + left + (left === 1 ? ' pendiente' : ' pendientes') +
                ' para el día, por lo que lleva un total del ' + percent + '% de su trabajo terminado.';
        }
        document.getElementById('aiResumeWidget').innerText = resume;
    } catch (err) {
        console.error("Error al cargar resumen: ", err);
    }
}

function renderTodayWidget() {
    return renderTaskTable('today', 'today', { status: 'A', date: todayString() }, 3, 'Sin tareas por ahora', false);
}

function renderFinishedWidget() {
    return renderTaskTable('finished', 'finished', { status: 'F' }, 3, 'Sin tareas terminadas aún', false);
}

function renderByTagWidget() {
    let filters = document.getElementById('byTagFilters');
    if (!filters) return;
    let noTags = document.getElementById('byTagNoTags'),
        content = document.getElementById('byTagContent');

    if (tagsCache.length === 0) {
        filters.innerHTML = '';
        content.classList.add('d-none');
        noTags.classList.remove('d-none');
        return;
    }
    noTags.classList.add('d-none');
    content.classList.remove('d-none');

    // Si no hay seleccion (o se elimino la etiqueta), seleccionar la primera
    if (!findTag(selectedTagHome)) selectedTagHome = tagsCache[0].id;

    renderTagFilters(filters, selectedTagHome, (id) => {
        selectedTagHome = id;
        pages.byTag = 1;
        renderByTagWidget();
    });
    return renderTaskTable('byTag', 'byTag', { status: 'A', tag: selectedTagHome }, 3, 'Sin tareas por mostrar', false);
}

// ===================== TASKS.HTML =====================

function renderTasksPage() {
    let filters = document.getElementById('tasksTagFilters');
    if (!filters) return;

    // Si la etiqueta de la URL ya no existe, mostrar todas
    if (selectedTagTasks && !findTag(selectedTagTasks)) selectedTagTasks = null;

    renderTagFilters(filters, selectedTagTasks, (id) => {
        // Click en la etiqueta seleccionada = quitar el filtro
        selectedTagTasks = Number(selectedTagTasks) === Number(id) ? null : id;
        pages.tasks = 1;
        let url = new URL(window.location.href);
        if (selectedTagTasks) url.searchParams.set('tag', selectedTagTasks);
        else url.searchParams.delete('tag');
        history.replaceState(null, '', url);
        renderTasksPage();
    });

    return renderTaskTable('tasks', 'tasks', { tag: selectedTagTasks }, 10,
        selectedTagTasks ? 'Sin tareas con esta etiqueta' : 'Sin tareas por ahora', true);
}

// Se llama desde init(): cada funcion valida si su vista existe en la pagina actual
function loadTasks() {
    renderUserSummary();
    renderTodayWidget();
    renderByTagWidget();
    renderFinishedWidget();
    renderTasksPage();
}

// ===================== CREATE =====================

function createTask(event) {
    event.preventDefault();
    let form = event.target,
        data = Object.fromEntries(new FormData(form).entries()),
        body = {
            title: data.title.trim(),
            due_date: data.due_date,
            status: 'A',
            tags: data.tag ? [Number(data.tag)] : [] // se guarda el ID de la etiqueta
        };

    fetch(local_url + 'tasks', {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(body)
    })
        .then(async response => {
            if (!response.ok) {
                alert(await response.text() || "Error al crear la tarea");
                return null;
            }
            return response.json();
        })
        .then(task => {
            if (!task) return;
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalTarea')).hide();
            form.reset();
            alert("Tarea creada con éxito");
            init();
        })
        .catch(err => console.error("Error al crear tarea: ", err));
}

// ===================== UPDATE =====================

// Funcion unica de update (checkbox y modal de edicion)
function updateTask(id, body) {
    return fetch(local_url + 'tasks/' + id, {
        method: 'PATCH',
        headers: authHeaders(true),
        body: JSON.stringify(body)
    })
        .then(async response => {
            if (!response.ok) {
                alert(await response.text() || "Error al actualizar la tarea");
                init(); // regresar el checkbox a su estado real
                return false;
            }
            init();
            return true;
        })
        .catch(err => {
            console.error("Error al actualizar tarea: ", err);
            return false;
        });
}

function editTask(task) {
    document.getElementById('edit_task_id').value = task.id;
    document.getElementById('edit_task_title').value = task.title;
    document.getElementById('edit_task_date').value = String(task.due_date || '').substring(0, 10);
    let tagId = Array.isArray(task.tags) && task.tags.length ? task.tags[0] : '';
    document.getElementById('edit_task_tag').value = findTag(tagId) ? tagId : '';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditTask')).show();
}

function saveEditTask(event) {
    event.preventDefault();
    let data = Object.fromEntries(new FormData(event.target).entries());
    updateTask(data.id, {
        title: data.title.trim(),
        due_date: data.due_date,
        tags: data.tag ? [Number(data.tag)] : []
    }).then(ok => {
        if (ok) bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditTask')).hide();
    });
}

// ===================== DELETE =====================

function confirmDeleteTask(task) {
    taskToDelete = task;
    document.getElementById('deleteTaskName').innerText = task.title;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDeleteTask')).show();
}

function deleteTask() {
    if (!taskToDelete) return;
    fetch(local_url + 'tasks/' + taskToDelete.id, {
        method: 'DELETE',
        headers: authHeaders(false)
    })
        .then(async response => {
            if (!response.ok) {
                alert(await response.text() || "Error al eliminar la tarea");
                return;
            }
            taskToDelete = null;
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDeleteTask')).hide();
            init();
        })
        .catch(err => console.error("Error al eliminar tarea: ", err));
}

document.addEventListener('DOMContentLoaded', () => {
    let formNewTask = document.getElementById('formNewTask'),
        formEditTask = document.getElementById('formEditTask'),
        btnConfirmDeleteTask = document.getElementById('btnConfirmDeleteTask');
    if (formNewTask) formNewTask.addEventListener('submit', createTask);
    if (formEditTask) formEditTask.addEventListener('submit', saveEditTask);
    if (btnConfirmDeleteTask) btnConfirmDeleteTask.addEventListener('click', deleteTask);
});
