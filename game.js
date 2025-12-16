const laberinto = document.getElementById("laberinto");
const jugador = document.getElementById("jugador");
const meta = document.getElementById("meta");
const mensaje = document.getElementById("mensaje");
const inicio = document.getElementById("inicio");
const btnInicio = document.getElementById("btnInicio");
const jumpscare = document.getElementById("jumpscare");
const video = document.getElementById("videoFinal");
const mensajeVideoTop = document.getElementById("mensaje-video-top");

let nivel = 1;
let bloqueado = true;
let x = 2;
let y = 2;
const paso = 1.5;

let teclas = {};
let intervalo = null;
let puedePasar = true;
let videoLoops = 0; // Contador de loops del video
let videoProtegido = true; // Protección contra clicks accidentales

/* DEFINICIÓN DE NIVELES MEJORADOS - DIFICULTAD MEDIA */
const niveles = {
    1: [
        // Laberinto en forma de U con paredes rojas estratégicas
        { x: 10, y: 10, w: 80, h: 5, roja: true },
        { x: 10, y: 10, w: 5, h: 80, roja: true },
        { x: 85, y: 10, w: 5, h: 80, roja: true },
        { x: 10, y: 85, w: 80, h: 5, roja: true },
        // Barreras internas
        { x: 30, y: 20, w: 40, h: 5, roja: false },
        { x: 20, y: 40, w: 5, h: 30, roja: false },
        { x: 60, y: 50, w: 20, h: 5, roja: false },
        { x: 75, y: 30, w: 5, h: 25, roja: false }
    ],

    2: [
        // Laberinto con múltiples caminos y pasillos estrechos
        { x: 0, y: 0, w: 100, h: 5, roja: true },
        { x: 0, y: 0, w: 5, h: 100, roja: true },
        { x: 95, y: 0, w: 5, h: 100, roja: true },
        { x: 0, y: 95, w: 100, h: 5, roja: true },
        // Laberinto interno - patrón en zigzag
        { x: 20, y: 15, w: 60, h: 5, roja: false },
        { x: 20, y: 15, w: 5, h: 30, roja: false },
        { x: 75, y: 15, w: 5, h: 30, roja: false },
        { x: 20, y: 40, w: 60, h: 5, roja: false },
        { x: 20, y: 40, w: 5, h: 30, roja: false },
        { x: 75, y: 40, w: 5, h: 30, roja: false },
        { x: 20, y: 65, w: 60, h: 5, roja: false },
        // Paredes rojas internas que bloquean caminos directos
        { x: 45, y: 25, w: 5, h: 15, roja: true },
        { x: 50, y: 50, w: 5, h: 15, roja: true },
        { x: 40, y: 70, w: 20, h: 5, roja: true }
    ],

    3: [
        // Laberinto complejo tipo espiral/maze
        { x: 10, y: 10, w: 80, h: 5, roja: true },
        { x: 10, y: 10, w: 5, h: 80, roja: true },
        { x: 85, y: 10, w: 5, h: 80, roja: true },
        { x: 10, y: 85, w: 80, h: 5, roja: true },
        // Espiral interna
        { x: 20, y: 20, w: 60, h: 5, roja: false },
        { x: 20, y: 20, w: 5, h: 60, roja: false },
        { x: 75, y: 20, w: 5, h: 60, roja: false },
        { x: 20, y: 75, w: 60, h: 5, roja: false },
        // Segunda capa
        { x: 30, y: 30, w: 40, h: 5, roja: false },
        { x: 30, y: 30, w: 5, h: 40, roja: false },
        { x: 65, y: 30, w: 5, h: 40, roja: false },
        { x: 30, y: 65, w: 40, h: 5, roja: false },
        // Tercera capa con trampas
        { x: 40, y: 40, w: 20, h: 5, roja: true },
        { x: 40, y: 40, w: 5, h: 20, roja: true },
        { x: 55, y: 40, w: 5, h: 20, roja: true },
        { x: 40, y: 55, w: 20, h: 5, roja: true },
        // Paredes estratégicas para crear laberinto
        { x: 15, y: 50, w: 10, h: 5, roja: false },
        { x: 50, y: 15, w: 5, h: 10, roja: false },
        { x: 80, y: 60, w: 10, h: 5, roja: false },
        { x: 60, y: 80, w: 5, h: 10, roja: false }
    ]
};

const jugadorAncho = 4;
const jugadorAlto = 4;

btnInicio.onclick = () => {
    inicio.style.display = "none";
    bloqueado = false;
    cargarNivel();
};

function cargarNivel() {
    document.querySelectorAll(".pared-roja, .pared-gris").forEach(p => p.remove());

    niveles[nivel].forEach(p => {
        const pared = document.createElement("div");
        pared.className = p.roja ? "pared-roja" : "pared-gris";
        Object.assign(pared.style, {
            left: p.x + "%",
            top: p.y + "%",
            width: p.w + "%",
            height: p.h + "%",
            position: "absolute"
        });
        laberinto.appendChild(pared);
    });

    reposicionarMeta();
    reiniciarJugador();
    mensaje.textContent = `Nivel ${nivel} - ¡Cuidado con las paredes rojas!`;
    // Restaurar estilo rojo normal
    mensaje.style.color = "red";
    mensaje.style.textShadow = "0 0 8px red";
    mensaje.style.animation = "textGlow 2s infinite";
    puedePasar = true;
    video.muted = true;
}

function reposicionarMeta() {
    switch(nivel) {
        case 1:
            // Meta en esquina superior derecha, pasando por laberinto
            meta.style.left = "90%";
            meta.style.top = "15%";
            break;
        case 2:
            // Meta en centro inferior, con camino complicado
            meta.style.left = "50%";
            meta.style.top = "85%";
            break;
        case 3:
            // Meta en centro exacto del laberinto espiral
            meta.style.left = "48%";
            meta.style.top = "48%";
            break;
    }
}

function reiniciarJugador() {
    // Posiciones iniciales diferentes por nivel
    switch(nivel) {
        case 1:
            x = 15;
            y = 15;
            break;
        case 2:
            x = 15;
            y = 90;
            break;
        case 3:
            x = 15;
            y = 90;
            break;
    }
    actualizarJugador();
}

function actualizarJugador() {
    jugador.style.left = x + "%";
    jugador.style.top = y + "%";
}

/* TECLADO */
document.addEventListener("keydown", e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        teclas[e.key] = true;
        e.preventDefault();
    }
});

document.addEventListener("keyup", e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        teclas[e.key] = false;
    }
});

// Loop de movimiento
setInterval(() => {
    if (bloqueado) return;
    
    let dx = 0, dy = 0;
    if (teclas["ArrowUp"]) dy = -paso;
    if (teclas["ArrowDown"]) dy = paso;
    if (teclas["ArrowLeft"]) dx = -paso;
    if (teclas["ArrowRight"]) dx = paso;
    
    if (dx !== 0 || dy !== 0) {
        mover(dx, dy);
    }
}, 35);

/* TÁCTIL CONTINUO */
document.querySelectorAll("#controles button").forEach(btn => {
    btn.addEventListener("pointerdown", e => {
        e.preventDefault();
        const dir = btn.dataset.dir;
        intervalo = setInterval(() => {
            if (dir === "up") mover(0, -paso);
            if (dir === "down") mover(0, paso);
            if (dir === "left") mover(-paso, 0);
            if (dir === "right") mover(paso, 0);
        }, 35);
    });

    btn.addEventListener("pointerup", detener);
    btn.addEventListener("pointerleave", detener);
});

function detener() {
    clearInterval(intervalo);
    intervalo = null;
}

/* MOVIMIENTO */
function mover(dx, dy) {
    const nuevoX = x + dx;
    const nuevoY = y + dy;

    if (nuevoX < 0 || nuevoY < 0 || nuevoX > 96 || nuevoY > 96) {
        reinicioPorError("¡Saliste del laberinto!");
        return;
    }

    const colisionRoja = hayColision(nuevoX, nuevoY, true);
    const colisionGris = hayColision(nuevoX, nuevoY, false);
    
    if (colisionRoja) {
        reinicioPorError("¡Tocaste una pared roja!");
        return;
    }
    
    if (colisionGris) {
        return;
    }

    x = nuevoX;
    y = nuevoY;
    actualizarJugador();
    verificarColisionMeta();
}

function hayColision(posX, posY, soloRojas) {
    const jLeft = posX;
    const jRight = posX + jugadorAncho;
    const jTop = posY;
    const jBottom = posY + jugadorAlto;

    for (const pared of niveles[nivel]) {
        if (soloRojas && !pared.roja) continue;
        if (!soloRojas && pared.roja) continue;
        
        const pLeft = pared.x;
        const pRight = pared.x + pared.w;
        const pTop = pared.y;
        const pBottom = pared.y + pared.h;

        if (jLeft < pRight &&
            jRight > pLeft &&
            jTop < pBottom &&
            jBottom > pTop) {
            return true;
        }
    }
    
    return false;
}

function verificarColisionMeta() {
    const jugadorRect = jugador.getBoundingClientRect();
    const metaRect = meta.getBoundingClientRect();
    
    const colisiona = !(jugadorRect.right < metaRect.left || 
                       jugadorRect.left > metaRect.right || 
                       jugadorRect.bottom < metaRect.top || 
                       jugadorRect.top > metaRect.bottom);
    
    if (colisiona && puedePasar) {
        pasarNivel();
    }
}

function reinicioPorError(mensajeError) {
    mensaje.textContent = mensajeError;
    mensaje.style.color = "red";
    mensaje.style.textShadow = "0 0 15px red";
    mensaje.style.animation = "textGlow 2s infinite";
    
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
    
    reiniciarJugador();
}

function pasarNivel() {
    puedePasar = false;
    bloqueado = true;
    
    // Cambiar TODO el estilo a verde - color, sombra y animación
    mensaje.style.color = "lime";
    mensaje.style.textShadow = "0 0 10px lime, 0 0 20px lime";
    mensaje.style.animation = "textGlowGreen 1.5s infinite";
    
    // Añadir animación verde si no existe
    if (!document.querySelector('#green-glow-style')) {
        const greenStyle = document.createElement('style');
        greenStyle.id = 'green-glow-style';
        greenStyle.textContent = `
            @keyframes textGlowGreen {
                0%, 100% { 
                    text-shadow: 0 0 10px lime, 0 0 20px lime;
                    color: lime;
                }
                50% { 
                    text-shadow: 0 0 20px lime, 0 0 30px lime, 0 0 40px lime;
                    color: #00ff00;
                }
            }
        `;
        document.head.appendChild(greenStyle);
    }
    
    meta.style.transform = "scale(1.3)";
    meta.style.boxShadow = "0 0 30px yellow";
    
    if (nivel < 3) {
        mensaje.textContent = `¡Nivel ${nivel} completado! Pasando al siguiente...`;
        
        setTimeout(() => {
            nivel++;
            bloqueado = false;
            cargarNivel();
        }, 500);
    } else {
        // Nivel 3 completado - Mostrar video
        mensaje.textContent = "¡HAS GANADO! Preparando sorpresa...";
        
        setTimeout(() => {
            // Resetear contador de loops
            videoLoops = 0;
            videoProtegido = true;
            
            // Configurar eventos del video
            video.onended = null;
            video.onclick = null;
            video.ontimeupdate = null;
            
            // Mostrar pantalla del video
            jumpscare.style.display = "block";
            
            // Mostrar mensaje especial
            mensajeVideoTop.style.display = "block";
            
            // Activar sonido
            video.muted = false;
            video.volume = 1.0;
            
            // Intentar reproducir
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log("Error al reproducir video:", e);
                    // Si falla por políticas de autoplay, mostrar mensaje
                    mostrarMensajeVideo();
                });
            }
            
            // Configurar protección y contador de loops
            configurarProteccionVideo();
            
        }, 1000);
    }
}

function configurarProteccionVideo() {
    // Reiniciar contadores
    videoLoops = 0;
    videoProtegido = true;
    
    // Detectar cuando el video reinicia (completa un loop)
    video.addEventListener('timeupdate', function() {
        // Si el video está cerca del final (último 10%)
        if (this.currentTime > this.duration * 0.9) {
            // Incrementar contador cuando se complete
            setTimeout(() => {
                videoLoops++;
                console.log(`Video loop completado: ${videoLoops}`);
                
                // Después de 3 loops, permitir click para salir
                if (videoLoops >= 3) {
                    videoProtegido = false;
                    mostrarBotonSalir();
                }
            }, 500);
        }
    });
    
    // Controlar clicks en el video
    video.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!videoProtegido) {
            // Después de 3 loops, permitir salir
            cerrarVideo();
        } else {
            // Mostrar mensaje de protección
            mostrarMensajeProteccion();
        }
        return false;
    };
    
    // También proteger el contenedor
    jumpscare.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!videoProtegido) {
            cerrarVideo();
        } else {
            mostrarMensajeProteccion();
        }
        return false;
    };
    
    // Permitir salir con tecla Escape en cualquier momento
    document.addEventListener('keydown', function videoKeyHandler(e) {
        if (e.key === 'Escape') {
            cerrarVideo();
            document.removeEventListener('keydown', videoKeyHandler);
        }
    });
}

function mostrarBotonSalir() {
    // Crear botón para salir
    let botonSalir = document.getElementById('boton-salir');
    if (!botonSalir) {
        botonSalir = document.createElement('button');
        botonSalir.id = 'boton-salir';
        botonSalir.innerHTML = 'VOLVER AL INICIO';
        botonSalir.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: red;
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 18px;
            border-radius: 10px;
            cursor: pointer;
            z-index: 40;
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.7);
            animation: pulse 1.5s infinite;
        `;
        document.body.appendChild(botonSalir);
        
        botonSalir.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            cerrarVideo();
            return false;
        };
    }
}

function mostrarMensajeProteccion() {
    // Crear mensaje temporal
    let mensajeProteccion = document.getElementById('mensaje-proteccion');
    if (!mensajeProteccion) {
        mensajeProteccion = document.createElement('div');
        mensajeProteccion.id = 'mensaje-proteccion';
        mensajeProteccion.innerHTML = '⚠️ El video se reiniciará automáticamente<br>Espera a que termine 3 veces para salir';
        mensajeProteccion.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 35;
            border: 2px solid red;
            animation: fadeInOut 3s forwards;
        `;
        document.body.appendChild(mensajeProteccion);
        
        setTimeout(() => {
            if (mensajeProteccion.parentNode) {
                mensajeProteccion.parentNode.removeChild(mensajeProteccion);
            }
        }, 3000);
    }
}

function mostrarMensajeVideo() {
    // Mensaje si no se puede reproducir automáticamente
    let mensajeVideo = document.getElementById('mensaje-video');
    if (!mensajeVideo) {
        mensajeVideo = document.createElement('div');
        mensajeVideo.id = 'mensaje-video';
        mensajeVideo.innerHTML = '🎬 Presiona aquí para ver el video<br><small>Toca la pantalla para comenzar</small>';
        mensajeVideo.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            z-index: 35;
            border: 3px solid red;
            cursor: pointer;
            font-size: 24px;
        `;
        document.body.appendChild(mensajeVideo);
        
        mensajeVideo.onclick = function() {
            video.play();
            if (mensajeVideo.parentNode) {
                mensajeVideo.parentNode.removeChild(mensajeVideo);
            }
        };
    }
}

function cerrarVideo() {
    // Limpiar todo y volver al inicio
    video.pause();
    video.currentTime = 0;
    video.muted = true;
    videoLoops = 0;
    videoProtegido = true;
    
    // Ocultar mensaje del video
    mensajeVideoTop.style.display = "none";
    
    // Remover botón de salir si existe
    const botonSalir = document.getElementById('boton-salir');
    if (botonSalir) {
        botonSalir.parentNode.removeChild(botonSalir);
    }
    
    // Remover mensajes si existen
    const mensajeProteccion = document.getElementById('mensaje-proteccion');
    if (mensajeProteccion && mensajeProteccion.parentNode) {
        mensajeProteccion.parentNode.removeChild(mensajeProteccion);
    }
    
    const mensajeVideo = document.getElementById('mensaje-video');
    if (mensajeVideo && mensajeVideo.parentNode) {
        mensajeVideo.parentNode.removeChild(mensajeVideo);
    }
    
    // Remover estilo de animación verde si existe
    const greenStyle = document.getElementById('green-glow-style');
    if (greenStyle) {
        greenStyle.parentNode.removeChild(greenStyle);
    }
    
    // Ocultar video y mostrar inicio
    jumpscare.style.display = "none";
    nivel = 1;
    inicio.style.display = "flex";
    bloqueado = true;
    mensaje.textContent = "¡Juego completado! Presiona 'Comenzar' para jugar otra vez";
    mensaje.style.color = "red";
    mensaje.style.textShadow = "0 0 8px red";
    mensaje.style.animation = "textGlow 2s infinite";
}

// Añadir CSS para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Inicializar el video
video.muted = true;
video.loop = true;
video.addEventListener('contextmenu', e => e.preventDefault());

// Mensaje inicial
mensaje.textContent = "Presiona 'Comenzar Juego' para iniciar";