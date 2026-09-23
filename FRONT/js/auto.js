let autoEnEdicion = null;

const obtenerValor = (auto, clave) => auto?.[clave] ?? auto?.[clave.charAt(0).toUpperCase() + clave.slice(1)] ?? "";

function obtenerDatos() {
    fetch("/api/Auto")
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al obtener los datos: " + response.status);
            }
            return response.json();
        })
        .then(data => MostrarDatos(data))
        .catch(() => {});
}

function formatearFecha(fecha) {
    if (!fecha) return "";

    const fechaObj = new Date(fecha);
    if (Number.isNaN(fechaObj.getTime())) return "";

    return fechaObj.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function crearBoton(texto, clase, callback) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.className = clase;
    boton.addEventListener("click", callback);
    return boton;
}

function MostrarDatos(datos) {
    const tbody = document.getElementById("autosTableBody");
    tbody.innerHTML = "";

    datos.forEach((auto) => {
        const tr = tbody.insertRow();
        const autoId = obtenerValor(auto, "autoId");

        tr.insertCell(0).textContent = obtenerValor(auto, "marca");
        tr.insertCell(1).textContent = obtenerValor(auto, "modelo");
        tr.insertCell(2).textContent = obtenerValor(auto, "año");
        tr.insertCell(3).textContent = obtenerValor(auto, "patente");
        tr.insertCell(4).textContent = obtenerValor(auto, "kilometraje");
        tr.insertCell(5).textContent = formatearFecha(obtenerValor(auto, "fechaIngreso"));
        tr.insertCell(6).textContent = obtenerValor(auto, "disponible") ? "Disponible" : "No Disponible";

        const tdAcciones = tr.insertCell(7);
        tdAcciones.className = "acciones-cell";

        const btnEditar = crearBoton("Editar", "btn btn-primary btn-sm", () => abrirModalEdicion(auto));
        const btnEliminar = crearBoton("Eliminar", "btn btn-danger btn-sm", () => eliminarAuto(autoId));

        tdAcciones.append(btnEditar, btnEliminar);
    });
}

function abrirModalEdicion(auto) {
    autoEnEdicion = auto;

    document.getElementById("editar-Marca").value = obtenerValor(auto, "marca");
    document.getElementById("editar-Modelo").value = obtenerValor(auto, "modelo");
    document.getElementById("editar-Año").value = obtenerValor(auto, "año");
    document.getElementById("editar-Patente").value = obtenerValor(auto, "patente");
    document.getElementById("editar-Kilometraje").value = obtenerValor(auto, "kilometraje");
    document.getElementById("editar-stock").value = obtenerValor(auto, "disponible") ? "Disponible" : "No Disponible";

    document.getElementById("form-editar-auto").dataset.autoId = obtenerValor(auto, "autoId");
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-editar-auto"));
    modal.show();
}

function eliminarAuto(autoId) {
    if (!autoId) return;
    if (!window.confirm("¿Desea eliminar este auto?")) return;

    fetch(`/api/Auto/${autoId}`, { method: "DELETE" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al eliminar");
            }
            obtenerDatos();
        })
        .catch(() => {});
}

function guardarEdicionAuto(event) {
    event.preventDefault();

    const autoId = Number(document.getElementById("form-editar-auto").dataset.autoId || autoEnEdicion?.autoId || autoEnEdicion?.AutoId);
    if (!autoId) return;

    const autoActualizado = {
        autoId,
        marca: document.getElementById("editar-Marca").value,
        modelo: document.getElementById("editar-Modelo").value,
        año: Number(document.getElementById("editar-Año").value),
        patente: document.getElementById("editar-Patente").value,
        kilometraje: Number(document.getElementById("editar-Kilometraje").value),
        fechaIngreso: obtenerValor(autoEnEdicion, "fechaIngreso") || new Date().toISOString(),
        disponible: document.getElementById("editar-stock").value === "Disponible"
    };

    fetch(`/api/Auto/${autoId}`, {
        method: "PUT",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(autoActualizado)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al actualizar");
            }
            bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-editar-auto")).hide();
            obtenerDatos();
        })
        .catch(() => {});
}

function agregarAuto() {
    const nuevoAuto = {
        Marca: document.getElementById("marca").value,
        Modelo: document.getElementById("modelo").value,
        Año: Number(document.getElementById("anio").value),
        Patente: document.getElementById("patente").value,
        Kilometraje: Number(document.getElementById("kilometraje").value),
        FechaIngreso: new Date().toISOString(),
        Disponible: document.getElementById("estado").value === "Disponible"
    };

    fetch("/api/Auto", {
        method: "POST",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(nuevoAuto)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error();
            }
            return response.json();
        })
        .then(() => {
            document.getElementById("autoCuestionario").reset();
            obtenerDatos();
        })
        .catch(() => {});
}

document.getElementById("autoCuestionario").addEventListener("submit", (event) => {
    event.preventDefault();
    agregarAuto();
});

document.getElementById("form-editar-auto").addEventListener("submit", guardarEdicionAuto);

obtenerDatos();