document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM completamente cargado");

    let clientesPorPais = {}; 

    function loadCountries() {
        fetch('SondeoClientes.xlsx')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    const countries = new Set();
                    jsonData.slice(1).forEach(row => {
                        const country = row[2];
                        const client = row[1];
                        if (country && client) {
                            countries.add(country);
                            if (!clientesPorPais[country]) {
                                clientesPorPais[country] = [];
                            }
                            clientesPorPais[country].push(client);
                        }
                    });

                    const sortedCountries = [...countries].sort();
                    const paisDropdown = document.getElementById('pais');
                    if (paisDropdown) {
                        paisDropdown.innerHTML = '<option value="">Seleccione su país...</option>';
                        sortedCountries.forEach(country => {
                            const option = document.createElement('option');
                            option.value = country;
                            option.textContent = country;
                            paisDropdown.appendChild(option);
                        });
                        console.log("🌍 Países cargados correctamente", sortedCountries);
                    }
                };
                reader.readAsArrayBuffer(blob);
            })
            .catch(error => console.error('❌ Error cargando el archivo:', error));
    }

    function resetPreguntas() {
        document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
            input.checked = false;
        });
        document.querySelectorAll('.dependiente').forEach(pregunta => {
            pregunta.style.display = 'none';
        });
    }

function loadClientsByCountry(paisSeleccionado) {
    const clientesDropdown = document.getElementById('clientes');
    if (clientesDropdown) {
        clientesDropdown.innerHTML = '<option value="">Seleccione un cliente</option>';
        if (clientesPorPais[paisSeleccionado]) {
            // 📌 Ordenar los clientes alfabéticamente antes de agregarlos
            const clientesOrdenados = [...clientesPorPais[paisSeleccionado]].sort();

            clientesOrdenados.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente;
                option.textContent = cliente;
                clientesDropdown.appendChild(option);
            });

            console.log("🔠 Clientes ordenados alfabéticamente para:", paisSeleccionado, clientesOrdenados);
        }
    }
}


    function toggleSeccion(from, to) {
        const fromSection = document.getElementById(from);
        const toSection = document.getElementById(to);
        
        fromSection.style.opacity = '0';
        fromSection.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            fromSection.classList.remove('active');
            fromSection.style.display = 'none';

            toSection.style.display = 'block';
            setTimeout(() => {
                toSection.classList.add('active');
                toSection.style.opacity = '1';
                toSection.style.transform = 'translateX(0)';
            }, 50);
        }, 500);
    }

    function toggleNavigationButtons(currentSection) {
        document.querySelectorAll('.btn-navegacion').forEach(btn => {
            btn.style.visibility = 'hidden';
        });
        
        if (currentSection === 'seccionCliente') {
            document.getElementById('btnVolver').style.visibility = 'visible';
            document.getElementById('btnSiguiente').style.visibility = 'visible';
        } else if (currentSection === 'seccionActividades') {
            document.getElementById('btnVolverActividades').style.visibility = 'visible';
            document.getElementById('btnSiguienteActividades').style.visibility = 'visible';
        }
    }

    function handleDependencias() {
        document.querySelectorAll('.pregunta input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => {
                const dependencias = {
                    "pregunta2": "pregunta2_1",
                    "pregunta3": ["pregunta3_1", "pregunta3_2"],
                    "pregunta4": ["pregunta4_1", "pregunta4_2"],
                    "pregunta6": "pregunta6_1"
                };
                
                Object.keys(dependencias).forEach(pregunta => {
                    const seleccion = document.querySelector(`input[name="${pregunta}"]:checked`);
                    const dependientes = Array.isArray(dependencias[pregunta]) ? dependencias[pregunta] : [dependencias[pregunta]];
                    
                    if (seleccion && seleccion.value === "si") {
                        dependientes.forEach(id => document.getElementById(id).style.display = 'block');
                    } else {
                        dependientes.forEach(id => {
                            document.getElementById(id).style.display = 'none';
                            document.querySelectorAll(`#${id} input`).forEach(input => input.checked = false);
                        });
                    }
                });
            });
        });
    }

    function handleMultipleSelection() {
    document.querySelectorAll('.opcion-segmento').forEach(button => {
        button.addEventListener('click', function () {
            this.classList.toggle('selected'); // ✅ Activa/desactiva el botón seleccionado
        });
    });
}


    //Evento ordenes de trabajo.
    function handleOrdenesTrabajo() {
    // 📌 Escuchar el cambio en los radio buttons de la pregunta 7
    document.querySelectorAll('input[name="pregunta7"]').forEach(input => {
        input.addEventListener('change', function () {
            let seccionOrdenes = document.getElementById('pregunta7_1');

            if (this.value === "si") {
                seccionOrdenes.style.display = "block";
            } else {
                seccionOrdenes.style.display = "none";
                // Resetear los valores de los inputs cuando se oculta
                seccionOrdenes.querySelectorAll('input[type="number"], input[type="date"], input[type="checkbox"]').forEach(input => {
                    input.checked = false;  // Desmarca checkboxes
                    input.value = "";       // Borra valores de cantidad y fecha
                });
                // Ocultar los inputs de cantidad y fecha si se oculta la sección
                seccionOrdenes.querySelectorAll('.ordenes-inputs').forEach(div => {
                    div.style.display = "none";
                });
            }
        });
    });

    // 📌 Activar los inputs de cantidad y fecha cuando se marca el checkbox en cada grupo de órdenes de trabajo
    document.querySelectorAll('.ordenes-checkbox input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            let inputsContainer = this.closest('.orden-trabajo').querySelector('.ordenes-inputs');

            if (this.checked) {
                inputsContainer.style.display = "flex";
            } else {
                inputsContainer.style.display = "none";
                inputsContainer.querySelectorAll('input[type="number"], input[type="date"]').forEach(input => input.value = "");
            }
        });
    });
}



    
//Activadores de checkbox de cantidad de actividades y ultimo registro de actividades.
function handleActividadInputs() {
    document.querySelectorAll('.opciones-checkbox input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            let labor = this.value;
            let container = this.closest("label").nextElementSibling; // Encuentra el contenedor de inputs
            
            if (this.checked) {
                container.style.display = "flex"; // Muestra los inputs cuando se marca el checkbox
            } else {
                container.style.display = "none"; // Oculta los inputs cuando se desmarca
                container.querySelector(".cantidad-input").value = ""; // Resetea la cantidad
                container.querySelector(".fecha-input").value = ""; // Resetea la fecha
            }
        });
    });
}


    
    document.getElementById('nextBtn')?.addEventListener('click', () => {
        const paisSeleccionado = document.getElementById('pais').value;
        if (paisSeleccionado) {
            resetPreguntas();
            loadClientsByCountry(paisSeleccionado);
            toggleSeccion('seccionPais', 'seccionCliente');
            toggleNavigationButtons('seccionCliente');
            handleDependencias();
        } else {
            alert("Debe seleccionar un país antes de continuar.");
        }
    });

    document.getElementById('clientes')?.addEventListener('change', () => {
        document.getElementById('preguntas').style.display = 'block';
        handleDependencias();
    });

    document.getElementById('btnVolver')?.addEventListener('click', () => {
        resetPreguntas();
        toggleSeccion('seccionCliente', 'seccionPais');
        toggleNavigationButtons('seccionPais');
    });
//Manejo de preguntas seccion avanzado.

    // 📌 Función para manejar las dependencias en la Sección Avanzada
function handleDependenciasSeccionAvanzada() {
    // ✅ Mostrar/Ocultar la Pregunta 8.1 cuando el usuario responde Sí en la Pregunta 8
    document.querySelectorAll('input[name="pregunta8"]').forEach(input => {
        input.addEventListener('change', function () {
            let seccion = document.getElementById('pregunta8_1');
            seccion.style.display = this.value === "si" ? "block" : "none";
        });
    });

    // ✅ Mostrar/Ocultar subcategorías dentro de Pregunta 8.1
    document.querySelectorAll('input[name="reportes"]').forEach(input => {
        input.addEventListener('change', function () {
            let subcategoria = document.querySelector(`.subcategoria[data-reporte="${this.value}"]`);
            if (subcategoria) {
                subcategoria.style.display = this.checked ? "block" : "none";
            }
        });
    });
}


    handleDependenciasSeccionAvanzada();


    
document.getElementById('btnSiguiente').addEventListener('click', () => {
    let allAnswered = true;
    document.querySelectorAll('#seccionCliente .pregunta').forEach(pregunta => {
        if (pregunta.style.display !== 'none') {
            const inputs = pregunta.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked');
            if (inputs.length === 0) {
                alert(`Debe responder la pregunta: "${pregunta.querySelector('p').innerText}"`);
                allAnswered = false;
            }
        }
    });
    
    if (allAnswered) {
        toggleSeccion('seccionCliente', 'seccionActividades');
        toggleNavigationButtons('seccionActividades');

        // 🔹 Llamamos la función aquí para que los inputs de cantidad y fecha se oculten hasta que el usuario marque los checkboxes.
        handleActividadInputs();
    }
});


    document.getElementById('btnVolverActividades')?.addEventListener('click', () => {
        toggleSeccion('seccionActividades', 'seccionCliente');
        toggleNavigationButtons('seccionCliente');
    });

    document.getElementById('btnSiguienteActividades')?.addEventListener('click', () => {
        alert("✔️ Sección completada. Aquí iría la siguiente sección o acción.");
    });

    loadCountries();
    handleDependencias();
    handleOrdenesTrabajo();
    handleMultipleSelection();
    handleActividadInputs();
    handleDependenciasSeccionAvanzada();

    
});

