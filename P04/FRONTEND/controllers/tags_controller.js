function crearEtiqueta() {
    event.preventDefault();
    let data = new FormData(event.target);
    fetch(local_url + 'tags', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth': JSON.parse(sessionStorage.user).password
        },
        body: JSON.stringify(Object.fromEntries(data.entries()))
    })
    .then(async response => {
        if (!response.ok) {
            let errorText = await response.text();
            alert(errorText || "Error al crear la etiqueta");
            return null;
        }
        return response.json();
    })
    .then(tag => {
        if (tag) {
            alert("Etiqueta creada con éxito");
            event.target.reset();
            let modalElement = document.getElementById('modalEtiqueta');
            if (modalElement && window.bootstrap) {
                let modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) modalInstance.hide();
            }
            init();
        }
    })
    .catch(err => {
        console.log("Aquí tronó");
        console.error("Error al crear etiqueta: ", err);
    });
}

function loadTagsDropdown() {
    if (!sessionStorage.user) return;
    fetch(local_url + 'tags?page=1&limit=200', {
        method: 'GET',
        headers: {
            'x-auth': JSON.parse(sessionStorage.user).password
        }
    })
    .then(response => {
        if (!response.ok) return null;
        return response.json();
    })
    .then(res => {
        if (!res) return;
        let tags = res.data || [];
        let dropdownList = document.querySelector('.dropdown-menu');
        if (!dropdownList) return;
        dropdownList.innerHTML = '';
        tags.forEach(tag => {
            let li = document.createElement('li');
            li.className = 'dropdown-item d-flex justify-content-between align-items-center';
            let a = document.createElement('a');
            a.className = 'text-decoration-none';
            a.innerText = tag.name;
            a.style.color = tag.color || '#000000';
            a.href = local_url + 'tasks.html?tag=' + tag.id;
            let btnEdit = document.createElement('button');
            btnEdit.className = 'btn btn-sm btn-outline-secondary ms-2';
            btnEdit.innerText = 'ICONO';
            btnEdit.onclick = (e) => {
                e.stopPropagation();
                editarEtiquetaPrompt(tag);
            };
            li.appendChild(a);
            li.appendChild(btnEdit);
            dropdownList.appendChild(li);
        });
        let addLi = document.createElement('li');
        addLi.innerHTML = `+ Nueva etiqueta`;
        dropdownList.appendChild(addLi);
    })
    .catch(err => {
        console.log("Aquí tronó");
        console.error("Error al cargar menú de etiquetas: ", err);
    });
}

function editarEtiquetaPrompt(tag) {
    let nuevoNombre = prompt("Editar nombre de la etiqueta:", tag.name);
    if (!nuevoNombre) return;
    let nuevoColor = prompt("Editar color de la etiqueta (Hexadecimal):", tag.color || "#000000");
    if (!nuevoColor) return;
    fetch(local_url + 'tags/' + tag.id, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth': JSON.parse(sessionStorage.user).password
        },
        body: JSON.stringify({ name: nuevoNombre, color: nuevoColor })
    })
    .then(async response => {
        if (!response.ok) {
            let errorText = await response.text();
            alert(errorText || "Error al actualizar la etiqueta");
            return null;
        }
        return response.json();
    })
    .then(res => {
        alert("Etiqueta actualizada correctamente");
        init();
    })
    .catch(err => console.error("Error al editar etiqueta: ", err));
}

function eliminarEtiqueta(idTag) {
    if (!confirm("¿Seguro que desea eliminar esta etiqueta?")) return;
    fetch(local_url + 'tags/' + idTag, {
        method: 'DELETE',
        headers: {
            'x-auth': JSON.parse(sessionStorage.user).password
        }
    })
    .then(async response => {
        if (!response.ok) {
            let errorText = await response.text();
            alert(errorText || "No se puede eliminar una etiqueta asignada a una tarea activa.");
            return null;
        }
        alert("Etiqueta eliminada con éxito");
        init();
    })
    .catch(err => console.error("Error al eliminar etiqueta: ", err));
}

document.addEventListener('DOMContentLoaded', () => {
    let formEtiqueta = document.querySelector('#modalEtiqueta form');
    if (formEtiqueta) {
        formEtiqueta.addEventListener('submit', crearEtiqueta);
    }
});