const API_BASE_URL = "https://apitp-api.onrender.com";

const obtenerValor = (auto, clave) => auto?.[clave] ?? auto?.[clave.charAt(0).toUpperCase() + clave.slice(1)] ?? "";

function mostrarMensaje(mensaje) {
    const elemento = document.getElementById("mensajeEstado");
    elemento.textContent = mensaje;
    elemento.hidden = false;
}

function limpiarMensaje() {
    const elemento = document.getElementById("mensajeEstado");
    elemento.textContent = "";
    elemento.hidden = true;
}

async function obtenerDatos() {
    limpiarMensaje();
    try {
        const response = await fetch(`${API_BASE_URL}/api/Auto`);
        if (!response.ok) {
            throw new Error(`Error al obtener los datos: ${response.status}`);
        }
        const datos = await response.json();
        MostrarDatos(datos);
    } catch (error) {
        mostrarMensaje(`No se pudo cargar el listado: ${error.message}`);
    }
}

function formatearFecha(fecha) {
    if (!fecha) return "";

    const fechaISO = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (fechaISO) return `${fechaISO[3]}/${fechaISO[2]}/${fechaISO[1]}`;

    const fechaObj = new Date(fecha);
    if (Number.isNaN(fechaObj.getTime())) return "";

    return fechaObj.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
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

        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.textContent = "Editar";
        btnEditar.className = "btn btn-primary btn-sm";
        btnEditar.addEventListener("click", (event) => abrirModalEdicion(auto, event.currentTarget));

        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.textContent = "Eliminar";
        btnEliminar.className = "btn btn-danger btn-sm";
        btnEliminar.addEventListener("click", () => eliminarAuto(autoId));

        tdAcciones.append(btnEditar, btnEliminar);
    });
}

function abrirModalEdicion(auto, botonEditar) {
    document.getElementById("editar-Marca").value = obtenerValor(auto, "marca");
    document.getElementById("editar-Modelo").value = obtenerValor(auto, "modelo");
    document.getElementById("editar-Año").value = obtenerValor(auto, "año");
    document.getElementById("editar-Patente").value = obtenerValor(auto, "patente");
    document.getElementById("editar-Kilometraje").value = obtenerValor(auto, "kilometraje");
    document.getElementById("editar-FechaIngreso").value = String(obtenerValor(auto, "fechaIngreso")).slice(0, 10);
    document.getElementById("editar-stock").value = obtenerValor(auto, "disponible") ? "Disponible" : "No Disponible";

    document.getElementById("form-editar-auto").dataset.autoId = obtenerValor(auto, "autoId");
    const modalElement = document.getElementById("modal-editar-auto");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show(botonEditar);
}

async function eliminarAuto(autoId) {
    if (!autoId) {
        mostrarMensaje("No se encontró el identificador del auto.");
        return;
    }
    if (!window.confirm("¿Desea eliminar este auto?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/Auto/${autoId}`, { method: "DELETE" });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || error.title || "Error al eliminar el auto.");
        }
        obtenerDatos();
    } catch (error) {
        mostrarMensaje(error.message);
    }
}

async function guardarEdicionAuto(event) {
    event.preventDefault();

    const autoId = Number(document.getElementById("form-editar-auto").dataset.autoId);
    if (!autoId) {
        mostrarMensaje("No se encontró el identificador del auto.");
        return;
    }

    const autoActualizado = {
        autoId,
        marca: document.getElementById("editar-Marca").value,
        modelo: document.getElementById("editar-Modelo").value,
        año: Number(document.getElementById("editar-Año").value),
        patente: document.getElementById("editar-Patente").value,
        kilometraje: Number(document.getElementById("editar-Kilometraje").value),
        fechaIngreso: `${document.getElementById("editar-FechaIngreso").value}T00:00:00`,
        disponible: document.getElementById("editar-stock").value === "Disponible"
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/Auto/${autoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(autoActualizado)
        });
        if (!response.ok) {
            throw new Error(`No se pudo actualizar el auto (HTTP ${response.status}).`);
        }
        bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-editar-auto")).hide();
        obtenerDatos();
    } catch (error) {
        mostrarMensaje(error.message);
    }
}

async function agregarAuto() {
    const fechaSeleccionada = document.getElementById("fechaIngreso").value;

    if (!fechaSeleccionada) return;

    const nuevoAuto = {
        Marca: document.getElementById("marca").value,
        Modelo: document.getElementById("modelo").value,
        Año: Number(document.getElementById("anio").value),
        Patente: document.getElementById("patente").value,
        Kilometraje: Number(document.getElementById("kilometraje").value),
        FechaIngreso: `${fechaSeleccionada}T00:00:00`,
        Disponible: document.getElementById("estado").value === "Disponible"
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/Auto`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoAuto)
        });
        if (!response.ok) {
            throw new Error(`No se pudo agregar el auto (HTTP ${response.status}).`);
        }
        document.getElementById("autoCuestionario").reset();
        obtenerDatos();
    } catch (error) {
        mostrarMensaje(error.message);
    }
}

document.getElementById("autoCuestionario").addEventListener("submit", (event) => {
    event.preventDefault();
    agregarAuto();
});

document.getElementById("form-editar-auto").addEventListener("submit", guardarEdicionAuto);

document.getElementById("modal-editar-auto").addEventListener("hide.bs.modal", (event) => {
    const modal = event.currentTarget;

    if (modal.contains(document.activeElement)) {
        document.activeElement.blur();
    }
});

obtenerDatos();