// Etiquetas del usuario, se recargan en cada init()
let tagsCache = [];

// ===================== HELPERS =====================

function findTag(id) {
    return tagsCache.find(t => Number(t.id) === Number(id));
}

// Texto blanco u oscuro segun el color de fondo
function textColorFor(hex) {
    let c = String(hex || '#6c757d').replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    let r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#212529' : '#ffffff';
}

// <span class="badge"> con el color de la etiqueta
function createTagBadge(tag) {
    let badge = document.createElement('span');
    badge.className = 'badge';
    badge.innerText = tag.name;
    badge.style.backgroundColor = tag.color;
    badge.style.color = textColorFor(tag.color);
    return badge;
}

// ===================== READ =====================

async function loadTags() {
    try {
        let response = await fetch(local_url + 'tags?page=1&limit=200', { headers: authHeaders(false) });
        if (!response.ok) return;
        let res = await response.json();
        tagsCache = res.data || [];
    } catch (err) {
        console.error("Error al cargar etiquetas: ", err);
        return;
    }
    renderTagsDropdown();
    fillTagSelects();
}

function renderTagsDropdown() {
    let tags_list = document.getElementById('dropdownList'),
        new_tag_item = document.getElementById('newTagItem');
    if (!tags_list) return;

    // Limpiar todo menos el boton "+ Nueva etiqueta"
    tags_list.querySelectorAll('.tag-item').forEach(li => li.remove());

    tagsCache.forEach(tag => {
        let li = document.createElement('li'),
            tag_container = document.createElement('a'),
            dot = document.createElement('i'),
            edit_tag_icon = document.createElement('i');

        li.className = 'tag-item';
        tag_container.className = 'dropdown-item d-flex align-items-center';
        tag_container.href = local_url + 'tasks.html?tag=' + tag.id;

        dot.className = 'fa-solid fa-circle me-2';
        dot.style.color = tag.color;
        dot.style.fontSize = '10px';

        edit_tag_icon.className = 'fa-solid fa-pen ms-auto';
        edit_tag_icon.title = 'Editar etiqueta';
        edit_tag_icon.style.cursor = 'pointer';
        edit_tag_icon.addEventListener('click', (e) => {
            // Que el lapiz no siga el link a tasks.html
            e.preventDefault();
            e.stopPropagation();
            editTag(tag);
        });

        tag_container.append(dot, document.createTextNode(tag.name), edit_tag_icon);
        li.append(tag_container);
        tags_list.insertBefore(li, new_tag_item);
    });
}

// Llena los <select> de etiquetas en los modales de tareas (si existen)
function fillTagSelects() {
    document.querySelectorAll('select.tag-select').forEach(select => {
        let selected = select.value;
        select.innerHTML = '<option value="">Sin etiqueta</option>';
        tagsCache.forEach(tag => {
            let opt = document.createElement('option');
            opt.value = tag.id;
            opt.innerText = tag.name;
            select.appendChild(opt);
        });
        if (findTag(selected)) select.value = selected;
    });
}

// ===================== CREATE / UPDATE =====================

// Abre el modal en modo "crear"
function newTag() {
    let form = document.getElementById('formTag');
    form.reset();
    document.getElementById('tag_id').value = '';
    document.getElementById('tagModalTitle').innerText = 'Nueva Etiqueta';
    document.getElementById('tagSubmitBtn').innerText = 'Crear Etiqueta';
    document.getElementById('tagDeleteBtn').classList.add('d-none');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEtiqueta')).show();
}

// Abre el mismo modal en modo "editar" con los datos de la etiqueta
function editTag(tag) {
    document.getElementById('tag_id').value = tag.id;
    document.getElementById('tag_name').value = tag.name;
    document.getElementById('tag_color').value = tag.color;
    document.getElementById('tagModalTitle').innerText = 'Editar Etiqueta';
    document.getElementById('tagSubmitBtn').innerText = 'Guardar cambios';
    document.getElementById('tagDeleteBtn').classList.remove('d-none');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEtiqueta')).show();
}

function saveTag(event) {
    event.preventDefault();
    let form = event.target,
        id = document.getElementById('tag_id').value,
        body = {
            name: document.getElementById('tag_name').value.trim(),
            color: document.getElementById('tag_color').value
        };

    // La etiqueta se asigna al usuario actual en Backend (por el header x-auth)
    fetch(local_url + 'tags' + (id ? '/' + id : ''), {
        method: id ? 'PATCH' : 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(body)
    })
        .then(async response => {
            if (!response.ok) {
                alert(await response.text() || "Error al guardar la etiqueta");
                return null;
            }
            return response.json();
        })
        .then(res => {
            if (!res) return;
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEtiqueta')).hide();
            form.reset();
            alert(id ? "Etiqueta actualizada correctamente" : "Etiqueta creada con éxito");
            init();
        })
        .catch(err => console.error("Error al guardar etiqueta: ", err));
}

// ===================== DELETE =====================

async function deleteTag() {
    let id = document.getElementById('tag_id').value;
    if (!id) return;
    if (!confirm("¿Seguro que desea eliminar esta etiqueta?")) return;

    // El Backend no deja borrar etiquetas asignadas a tareas; se valida antes
    // para no provocar un 400 (que aparece como error en la consola)
    try {
        let used = await fetch(local_url + 'tasks?page=1&limit=1&tag=' + id, { headers: authHeaders(false) })
            .then(response => response.json());
        if (used.total > 0) {
            alert("No se puede eliminar la etiqueta porque está asignada a " + used.total +
                (used.total === 1 ? " tarea." : " tareas."));
            return;
        }
    } catch (err) {
        console.error("Error al validar etiqueta: ", err);
        return;
    }

    fetch(local_url + 'tags/' + id, {
        method: 'DELETE',
        headers: authHeaders(false)
    })
        .then(async response => {
            if (!response.ok) {
                alert(await response.text() || "No se pudo eliminar la etiqueta");
                return;
            }
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEtiqueta')).hide();
            alert("Etiqueta eliminada con éxito");
            init();
        })
        .catch(err => console.error("Error al eliminar etiqueta: ", err));
}

document.addEventListener('DOMContentLoaded', () => {
    let formTag = document.getElementById('formTag'),
        tagDeleteBtn = document.getElementById('tagDeleteBtn');
    if (formTag) formTag.addEventListener('submit', saveTag);
    if (tagDeleteBtn) tagDeleteBtn.addEventListener('click', deleteTag);
});
