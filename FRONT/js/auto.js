function obtenerDatos() {
    fetch("/api/Auto")
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al obtener los datos: " + response.status);
            }
            return response.json();
        })
        .then(data => {
            MostrarDatos(data);
        })
        .catch(() => {
        });
}

function MostrarDatos(datos) {
    const tbody = document.getElementById("autosTableBody");
    tbody.innerHTML = "";

    datos.forEach(auto => {
        const tr = tbody.insertRow();
        tr.insertCell(0).textContent = auto.marca;
        tr.insertCell(1).textContent = auto.modelo;
        tr.insertCell(2).textContent = auto.año;
        tr.insertCell(3).textContent = auto.patente;
        tr.insertCell(4).textContent = auto.kilometraje;
        tr.insertCell(5).textContent = auto.disponible ? "Disponible" : "No Disponible";
    });
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
        .catch(() => {
        });
}

document.getElementById("autoCuestionario").addEventListener("submit", function (event) {
    event.preventDefault();
    agregarAuto();
});

obtenerDatos();