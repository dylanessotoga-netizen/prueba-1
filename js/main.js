document.addEventListener("DOMContentLoaded", () => {

    // =========================================================================
    // 1. TRANSICIÓN DE TARJETAS EN EL MENÚ PRINCIPAL (INDEX)
    // =========================================================================
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        card.addEventListener("click", function() {
            const targetUrl = this.getAttribute("data-target");
            if (targetUrl) {
                this.style.transform = "scale(0.95)";
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 150);
            }
        });
    });

    // =========================================================================
    // 2. CONTROLES DEL REPRODUCTOR Y MENÚS LATERALES
    // =========================================================================
    const video = document.getElementById("main-video");
    const videoSource = document.getElementById("video-source");
    const videoContainer = document.getElementById("video-container");
    const fullscreenBtn = document.getElementById("video-fullscreen-btn");

    if (fullscreenBtn && videoContainer) {
        fullscreenBtn.addEventListener("click", async () => {
            try {
                if (document.fullscreenElement === videoContainer) {
                    await document.exitFullscreen();
                } else {
                    await videoContainer.requestFullscreen();
                }
            } catch (error) {
                console.error("No se pudo cambiar el modo de pantalla completa:", error);
            }
        });

        document.addEventListener("fullscreenchange", () => {
            const isFullscreen = document.fullscreenElement === videoContainer;
            fullscreenBtn.setAttribute("aria-label", isFullscreen ? "Salir de pantalla completa" : "Activar pantalla completa");
            fullscreenBtn.title = isFullscreen ? "Salir de pantalla completa" : "Pantalla completa";
        });
    }

    // Menú Izquierdo (Secciones/Capítulos)
    const toggleBtn = document.getElementById("toggle-sidebar-btn");
    const closeBtn = document.getElementById("close-sidebar-btn");
    const chapterBtns = document.querySelectorAll(".chapter-btn");

    // Menú Derecho (Opciones de Video)
    const toggleRightBtn = document.getElementById("toggle-right-sidebar-btn");
    const closeRightBtn = document.getElementById("close-right-sidebar-btn");
    const videoChangeBtns = document.querySelectorAll(".video-change-btn");

    // Modal HUD e Imagen
    const interactiveOverlay = document.getElementById("interactive-layer");
    const interactiveTitle = document.getElementById("interactive-title");
    const interactiveText = document.getElementById("interactive-text");
    const interactiveImage = document.getElementById("interactive-image");
    const btnResume = document.getElementById("btn-resume");
    const btnHelp = document.getElementById("btn-help");

    // Botón Flotante HUD Lateral
    const hudPanelFlotante = document.getElementById("hud-panel-flotante");
    const btnHudFlotante = document.getElementById("btn-hud-flotante");
    const hudFlotanteTexto = document.getElementById("hud-flotante-texto");

    let isNavigating = false;
    let isModalOpen = false;
    let ultimoTiempo = 0;
    let botonFlotanteActual = null;
    let ultimoBotonPausado = null;

    // --- Abrir / Cerrar Menús Laterales ---
    if (toggleBtn) toggleBtn.addEventListener("click", (e) => { e.stopPropagation(); document.body.classList.remove("right-sidebar-open"); document.body.classList.add("sidebar-open"); });
    if (closeBtn) closeBtn.addEventListener("click", (e) => { e.stopPropagation(); document.body.classList.remove("sidebar-open"); });
    if (toggleRightBtn) toggleRightBtn.addEventListener("click", (e) => { e.stopPropagation(); document.body.classList.remove("sidebar-open"); document.body.classList.add("right-sidebar-open"); });
    if (closeRightBtn) closeRightBtn.addEventListener("click", (e) => { e.stopPropagation(); document.body.classList.remove("right-sidebar-open"); });

    // --- Cambio Dinámico de Video ---
    videoChangeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const newSrc = btn.getAttribute("data-video");
            if (newSrc && video && videoSource) {
                videoSource.src = newSrc;
                video.load();
                ocultarModal();
                reiniciarAlertas();
                video.play().catch(() => {});
                videoChangeBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            }
        });
    });

    // --- Botón Reanudar Video ---
    if (btnResume) {
        btnResume.addEventListener("click", (e) => {
            e.preventDefault();
            ocultarModal();
            if (video) video.play().catch(() => {});
        });
    }

    // --- Saltos en Capítulos del Menú Izquierdo ---
    chapterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const time = parseFloat(btn.getAttribute("data-time"));
            if (!isNaN(time) && video) {
                isNavigating = true;
                ocultarModal();
                video.currentTime = time;
                video.play().then(() => {
                    setTimeout(() => { isNavigating = false; }, 400);
                }).catch(() => { isNavigating = false; });
                chapterBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            }
        });
    });

    // =========================================================================
    // 3. CONFIGURACIÓN DE ALERTAS AUTOMÁTICAS HUD MODAL POR MÁQUINA
    // =========================================================================
    const configuracionesAlertas = {
        trefiladora: [
            { tiempo: 30, titulo: "Nota", mensaje: "Cuando el alambrón se sale de las poleas se debe enviar la orden a mantenimiento por trabajo en alturas, de debe utilizar el manlift.", imagen: "", linkManual: "assets/docs/manual_tecnico_p1.pdf", visto: false },
            { tiempo: 55, titulo: "Nota", mensaje: "Tenga en cuenta que, para pasar las poleas por cada uno de los dados, es necesario reducir el diámetro del alambrón o alambre de entrada. Para ello, se utiliza la herramienta denominada “sacapuntas”.", imagen: "", linkManual: "assets/docs/manual_tecnico_p2.pdf", visto: false },
            { tiempo: 75, titulo: "Nota", mensaje: "siempre inicie a realizar las vueltas dell enhebrado de adentro hacia afuera.", imagen: "", linkManual: "assets/docs/manual_tecnico.pdf", visto: false },
            { tiempo: 110, titulo: "Nota", mensaje: "Antes de iniciar el enhebrado del recocedor, asegúrese de cerrar la válvula de aire del equipo y de tener apagada la corriente eléctrica del recocedor.", imagen: "", linkManual: "assets/docs/manual_tecnico.pdf", visto: false },
            { tiempo: 128, titulo: "Nota", mensaje: "Mantenga siempre presente que el recorrido debe realizarse en sentido de izquierda a derecha.", imagen: "", linkManual: "assets/docs/manual_tecnico.pdf", visto: false },
            { tiempo: 138, titulo: "Nota", mensaje: "Verifique que las puertas internas del recocedor y las puertas principales queden correctamente cerradas antes de continuar con la operación.", imagen: "", linkManual: "assets/docs/manual_tecnico.pdf", visto: false },
            { tiempo: 180, titulo: "Nota muy importante", mensaje: "Para mas informacion sobre el henadrado del encestador, ir al instructivo", imagen: "", linkManual: "assets/docs/manual_tecnico_final.pdf", visto: false }
        ],
        cableadora: [
            { tiempo: 57, titulo: "Nota", mensaje: "Cuando se requiera ajuste de resistencia o diámetro de producto puede ajustar el enhebrado, tomar una muestra y registrar la novedad en el gráfico de control.", imagen: "assets/images/cableadora_alerta1.jpg", linkManual: "assets/docs/manual_cableadora_p1.pdf", visto: false },
            { tiempo: 72, titulo: "Nota", mensaje: "Validar la hoja de proceso si se requiere uso de boquilla", imagen: "assets/images/cableadora_alerta2.jpg", linkManual: "assets/docs/manual_cableadora_p2.pdf", visto: false }
        ],
        extrusora: [
            { tiempo: 4.0, titulo: "Extrusora: Temperatura", mensaje: "Punto de Decisión: Confirme que la temperatura de las zonas de calor alcanzó el nivel óptimo.", imagen: "", linkManual: "assets/docs/manual_extrusora.pdf", visto: false },
            { tiempo: 8.0, titulo: "Extrusora: Presión", mensaje: "Alerta Operativa: Revise la presión del cabezal y confirme el diámetro del cable a la salida.", imagen: "", linkManual: "assets/docs/manual_extrusora.pdf", visto: false }
        ]
    };

    // =========================================================================
    // 4. CONFIGURACIÓN DE BOTONES FLOTANTES HUD POR MÁQUINA
    // =========================================================================
    const configuracionesBotonesFlotantes = {
        trefiladora: [
            { inicio: 26, fin: 28.5, etiqueta: "Seguridad", tituloModal: "Condiciones de Seguridad Mecánico", mensajeModal: " Por golpes, atrapamiento, machucones, cortes, al cortar el suncho para sacar la punta del alambron.", imagenModal: "assets/img/captura.png", linkManual: "assets/docs/manual_seguridad.pdf" },
            { inicio: 29, fin: 31.5, etiqueta: "Seguridad", tituloModal: "Condiciones de Seguridad Locativo", mensajeModal: "Caída al mismo nivel o diferente nivel, tropiezos y golpes con soportes de la maquina y otros elementos del área de trabajo y condiciones locativas al enhebrar alambron en polea.", imagenModal: "assets/img/locatico.png", linkManual: "assets/docs/manual_epp.pdf" },
            { inicio: 35, fin: 38.5, etiqueta: "Seguridad", tituloModal: "Condiciones de Seguridad Locativo", mensajeModal: "Caída al mismo nivel o diferente nivel, tropiezos y golpes con soportes de la maquina y otros elementos del área de trabajo y condiciones locativas.", imagenModal: "assets/img/locatico.png", linkManual: "assets/docs/manual_dados.pdf" },
            { inicio: 47, fin: 49.5, etiqueta: "seguridad", tituloModal: "Biomecánico", mensajeModal: " Postura mantenida o inadecuada al realizar la apertura de la perilla.", imagenModal: "assets/img/locatico.png", linkManual: "assets/docs/manual_emergencia.pdf" },
            { inicio: 57, fin: 60.5, etiqueta: "seguridad", tituloModal: "Quimico - Liquidos, nieblas y Rocios", mensajeModal: "contacto con sustacia quimica Lubricante la cual puede ocasionar salpicadura.", imagenModal: "assets/img/Quimico", linkManual: "assets/docs/manual_lubricacion.pdf" },
            { inicio: 68, fin: 71.5, etiqueta: "Seguridad", tituloModal: "Condiciones de Seguridad Mecánico", mensajeModal: "Por golpes, atrapamiento, machucones, al guiar el alambre a través de las poleas", imagenModal: "assets/img/Captura.png", linkManual: "assets/docs/manual_embobinador.pdf" },
            { inicio: 142, fin: 145.5, etiqueta: "Seguridad", tituloModal: "Biomecánico", mensajeModal: "por postura mantenida o forzada, al enhebrar las poleas.", imagenModal: "assets/img/Biomecanico.png", linkManual: "assets/docs/manual_encestador.pdf" },
            { inicio: 164, fin: 167.5, etiqueta: "Seguridad", tituloModal: "Condiciones de Seguridad - Electrico", mensajeModal: "Cortos eléctricos, electrocución por contacto con partes eléctricas de la maquina (obturadores, cables, enchufes y toma-corrientes, etc.).", imagenModal: "assets/img/Electricidad.png", linkManual: "assets/docs/manual_atascos.pdf" },
            { inicio: 170, fin: 173.5, etiqueta: "Seguridad", tituloModal: "Biomecánico", mensajeModal: "por postura mantenida o forzada, al realizar el enhebrado del alambre.", imagenModal: "assets/img/Biomecanico.png", linkManual: "assets/docs/manual_limpieza.pdf" }
        ],
        cableadora: [
            { inicio: 31, fin: 33.5, etiqueta: "Seguridad", tituloModal: "Condiciones de Seguridad Mecánico", mensajeModal: "Por golpes, atrapamiento, machucones, al hacer enhebrado por poleas.", imagenModal: "assets/img/captura.png", linkManual: "assets/docs/manual_cab_31.pdf" },
            { inicio: 47, fin: 49.5, etiqueta: "Seguridad", tituloModal: "Condiciones de Seguridad Locativo", mensajeModal: "Caída al mismo nivel o diferente nivel, tropiezos y golpes con soportes de la máquina y otros elementos del área de trabajo y condiciones locativas.", imagenModal: "assets/img/locatico.png", linkManual: "assets/docs/manual_cab_47.pdf" },
            { inicio: 48, fin: 50.5, etiqueta: "Seguridad", tituloModal: "Condiciones de Seguridad Mecánico", mensajeModal: "Por golpes, atrapamiento, machucones, al hacer enhebrado por poleas.", imagenModal: "assets/img/captura.png", linkManual: "assets/docs/manual_cab_48.pdf" },
            { inicio: 58, fin: 60.5, etiqueta: "Seguridad", tituloModal: "Biomecánico", mensajeModal: " por postura mantenida o forzada, al realizar el enhebrado por los rodillos.", imagenModal: "assets/img/Biomecanico.png", linkManual: "assets/docs/manual_cab_58.pdf" },
            { inicio: 72, fin: 74.5, etiqueta: "Seguridad", tituloModal: "Condiciones de Seguridad Mecánico", mensajeModal: "Por golpes, atrapamiento, machucones, al hacer enhebrado por los dados.", imagenModal: "assets/img/captura.png", linkManual: "assets/docs/manual_cab_72.pdf" },
            { inicio: 78, fin: 80.5, etiqueta: "Seguridad", tituloModal: "Condiciones de Seguridad Mecánico", mensajeModal: "Por golpes, atrapamiento, machucones, aplastamiento al hacer movimiento de carretes.", imagenModal: "assets/img/captura.png", linkManual: "assets/docs/manual_cab_78.pdf" },
            { inicio: 100, fin: 102.5, etiqueta: "Seguridad", tituloModal: "Condiciones de Seguridad Mecánico", mensajeModal: "Caída de objetos por izaje, aplastamiento, golpes, machucones al momento de Izar el carrete.", imagenModal: "assets/img/arriba.png", linkManual: "assets/docs/manual_cab_100.pdf" },
            { inicio: 118, fin: 120.5, etiqueta: "Seguridad", tituloModal: "Condiciones de Seguridad Mecánico", mensajeModal: "Por golpes, atrapamiento, machucones, aplastamiento al hacer el retiro de la eslinga del gancho de izaje.", imagenModal: "assets/img/captura.png", linkManual: "assets/docs/manual_cab_118.pdf" },
            { inicio: 132, fin: 134.5, etiqueta: "Seguridad", tituloModal: "Condiciones de Seguridad - Eléctrico", mensajeModal: "Cortos eléctricos, electrocución por contacto con partes eléctricas de la máquina (obturadores, cables, enchufes y toma-corrientes, etc.).", imagenModal: "assets/img/Electicidad.png", linkManual: "assets/docs/manual_cab_132.pdf" },
            { inicio: 141, fin: 143.5, etiqueta: "Seguridad", tituloModal: "Condiciones de Seguridad Mecánico", mensajeModal: "Por golpes, atrapamiento, machucones, al pasar el cambio de la caja.", imagenModal: "assets/img/captura.png", linkManual: "assets/docs/manual_cab_141.pdf" },
            { inicio: 150, fin: 152.5, etiqueta: "seguridad", tituloModal: "Condiciones de Seguridad Mecánico", mensajeModal: " Por golpes, atrapamiento, machucones, cortaduras, en el uso de herramientas manuales.", imagenModal: "assets/img/Herramienta.png", linkManual: "assets/docs/manual_cab_150.pdf" },
            { inicio: 171, fin: 173.5, etiqueta: "seguridad", tituloModal: "Condiciones de Seguridad Locativo", mensajeModal: "Caída al mismo nivel o diferente nivel, tropiezos y golpes con soportes de la máquina y otros elementos del área de trabajo y condiciones locativas.", imagenModal: "assets/img/locatico.png", linkManual: "assets/docs/manual_cab_171.pdf" },
            { inicio: 218, fin: 220.5, etiqueta: "seguridad", tituloModal: "Condiciones de Seguridad Mecánico", mensajeModal: " Por golpes, atrapamiento, machucones, al hacer enhebrado del cable.", imagenModal: "assets/img/captura.png", linkManual: "assets/docs/manual_cab_218.pdf" },
        ]
    };

    // Selección de listas de acuerdo a la URL
    const urlActual = window.location.href.toLowerCase();
    let alertasModal = configuracionesAlertas.trefiladora;
    let botonesFlotantesHUD = configuracionesBotonesFlotantes.trefiladora;

    if (urlActual.includes("cableadora")) {
        alertasModal = configuracionesAlertas.cableadora;
        botonesFlotantesHUD = configuracionesBotonesFlotantes.cableadora;
    } else if (urlActual.includes("extrusora")) {
        alertasModal = configuracionesAlertas.extrusora;
        botonesFlotantesHUD = configuracionesBotonesFlotantes.extrusora || [];
    }

    // Clic en el Botón Flotante Lateral HUD
    if (btnHudFlotante) {
        btnHudFlotante.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (botonFlotanteActual) {
                mostrarModal(
                    botonFlotanteActual.tituloModal,
                    botonFlotanteActual.mensajeModal,
                    botonFlotanteActual.imagenModal,
                    botonFlotanteActual.linkManual
                );
            }
        };
    }

    // =========================================================================
    // 5. BUCLE DE MONITOREO DE ALTA PRECISIÓN (VERIFICA CADA 100 MS)
    // =========================================================================
    setInterval(() => {
        if (!video || isNavigating) return;

        const currentTime = video.currentTime;

        // Reiniciar estados al retroceder en el reproductor
        if (currentTime < ultimoTiempo - 1.5) {
            reiniciarAlertas();
            ultimoBotonPausado = null;
        }
        ultimoTiempo = currentTime;

        // Si el modal está activo, mantener en pausa
        if (isModalOpen) {
            if (!video.paused) video.pause();
            return;
        }

        // 1. Alertas Automáticas Modal
        alertasModal.forEach(alerta => {
            if (currentTime >= alerta.tiempo && currentTime <= (alerta.tiempo + 1.2) && !alerta.visto) {
                alerta.visto = true;
                mostrarModal(alerta.titulo, alerta.mensaje, alerta.imagen, alerta.linkManual);
            }
        });

        // 2. Visibilidad + Pausa Automática para Botones Flotantes
        let activo = null;
        botonesFlotantesHUD.forEach(item => {
            if (currentTime >= item.inicio && currentTime <= item.fin) {
                activo = item;
            }
        });

        if (activo) {
            botonFlotanteActual = activo;
            if (hudFlotanteTexto) hudFlotanteTexto.textContent = activo.etiqueta;
            if (hudPanelFlotante) hudPanelFlotante.style.display = 'block';

            if (ultimoBotonPausado !== activo.inicio) {
                ultimoBotonPausado = activo.inicio;
                if (!video.paused) {
                    video.pause();
                }
            }
        } else {
            if (hudPanelFlotante) hudPanelFlotante.style.display = 'none';
            botonFlotanteActual = null;
        }

        // 3. Sincronización menú de capítulos
        chapterBtns.forEach((btn, index) => {
            const chapterTime = parseFloat(btn.getAttribute("data-time"));
            const nextBtn = chapterBtns[index + 1];
            const nextTime = nextBtn ? parseFloat(nextBtn.getAttribute("data-time")) : Infinity;

            if (currentTime >= chapterTime && currentTime < nextTime) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    }, 100);

    // =========================================================================
    // 6. FUNCIONES AUXILIARES DE MANEJO DE MODAL Y PAUSA
    // =========================================================================
    function mostrarModal(titulo, mensaje, imagenSrc, linkManual) {
        isModalOpen = true;

        if (video) {
            video.pause();
            setTimeout(() => { video.pause(); }, 50);
        }

        if (interactiveTitle) interactiveTitle.textContent = titulo;
        
        if (interactiveText) {
            interactiveText.textContent = mensaje;
        } else {
            const pElem = document.querySelector(".hud-body p");
            if (pElem) pElem.textContent = mensaje;
        }

        if (interactiveImage) {
            if (imagenSrc && imagenSrc.trim() !== "") {
                interactiveImage.src = imagenSrc;
                interactiveImage.style.display = "block";
            } else {
                interactiveImage.style.display = "none";
                interactiveImage.src = "";
            }
        }

        if (btnHelp) {
            if (linkManual && linkManual.trim() !== "") {
                btnHelp.href = linkManual;
                btnHelp.style.display = "inline-flex";
            } else {
                btnHelp.href = "#";
            }
        }

        if (interactiveOverlay) {
            interactiveOverlay.style.display = "flex";
            interactiveOverlay.classList.add("active");
        }
    }

    function ocultarModal() {
        isModalOpen = false;
        if (interactiveOverlay) {
            interactiveOverlay.style.display = "none";
            interactiveOverlay.classList.remove("active");
        }
    }

    function reiniciarAlertas() {
        alertasModal.forEach(alerta => { alerta.visto = false; });
    }

    window.mostrarInteraccion = function(seccion) {
        let mensajeSeguridad = "Recuerde usar su equipo de protección personal (EPP) completo: gafas, protectores auditivos, guantes y botas de seguridad antes de operar o intervenir la máquina.";
        if (seccion !== 'Seguridad') {
            mensajeSeguridad = "Has abierto la sección de " + seccion + ".";
        }
        mostrarModal("Alerta de " + seccion, mensajeSeguridad, "", "assets/docs/manual_seguridad.pdf");
    };
});