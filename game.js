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
let videoLoops = 0;
let videoProtegido = true;

/* DEFINICIÓN DE NIVELES - NIVEL 3 MÁS DIFÍCIL */
const niveles = {
    1: [
        { x: 30, y: 20, w: 5, h: 60, roja: true },
        { x: 20, y: 60, w: 25, h: 5, roja: false },
        { x: 65, y: 30, w: 5, h: 40, roja: false }
    ],

    2: [
        { x: 25, y: 15, w: 5, h: 50, roja: true },
        { x: 60, y: 35, w: 5, h: 50, roja: true },
        { x: 45, y: 45, w: 10, h: 5, roja: false }
    ],

    3: [
        // PATRÓN EN ZIGZAG MÁS COMPLEJO
        // Pared roja 1 - Diagonal principal
        { x: 20, y: 10, w: 5, h: 80, roja: true },
        
        // Pared roja 2 - Diagonal que cruza
        { x: 50, y: 10, w: 5, h: 80, roja: true },
        
        // Pared roja 3 - Horizontal estratégica
        { x: 75, y: 40, w: 5, h: 50, roja: true },
        
        // Pared roja 4 - Bloqueo extra (adicional para mayor dificultad)
        { x: 40, y: 60, w: 30, h: 5, roja: true },
        
        // Pared roja 5 - Pasillo estrecho
        { x: 65, y: 20, w: 20, h: 5, roja: true }
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
    mensaje.textContent = `Nivel ${nivel} - ¡Encuentra el camino seguro!`;
    if (nivel === 3) {
        mensaje.textContent = `Nivel ${nivel} - ¡Cuidado! Este es el más difícil`;
    }
    mensaje.style.color = "red";
    mensaje.style.textShadow = "0 0 8px red";
    mensaje.style.animation = "textGlow 2s infinite";
    puedePasar = true;
    video.muted = true;
}

function reposicionarMeta() {
    switch(nivel) {
        case 1:
            meta.style.left = "90%";
            meta.style.top = "90%";
            break;
        case 2:
            meta.style.left = "50%";
            meta.style.top = "15%";
            break;
        case 3:
            // Meta en posición más complicada - esquina superior derecha
            meta.style.left = "92%";
            meta.style.top = "15%";
            break;
    }
}

function reiniciarJugador() {
    switch(nivel) {
        case 1:
            x = 5;
            y = 5;
            break;
        case 2:
            x = 5;
            y = 90;
            break;
        case 3:
            // Posición inicial más alejada de la meta
            x = 5;
            y = 85;
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

/* TÁCTIL CONTINUO - VERSIÓN SIMPLIFICADA Y ROBUSTA */
document.querySelectorAll("#controles button").forEach(btn => {
    let activeInterval = null;
    let isActive = false;
    
    // Función para iniciar movimiento
    const startMoving = (dir) => {
        if (bloqueado || isActive) return;
        
        isActive = true;
        
        // Movimiento inmediato
        if (dir === "up") mover(0, -paso);
        if (dir === "down") mover(0, paso);
        if (dir === "left") mover(-paso, 0);
        if (dir === "right") mover(paso, 0);
        
        // Intervalo para movimiento continuo
        activeInterval = setInterval(() => {
            if (bloqueado || !isActive) {
                clearInterval(activeInterval);
                activeInterval = null;
                return;
            }
            
            if (dir === "up") mover(0, -paso);
            if (dir === "down") mover(0, paso);
            if (dir === "left") mover(-paso, 0);
            if (dir === "right") mover(paso, 0);
        }, 35);
    };
    
    // Función para detener movimiento
    const stopMoving = () => {
        isActive = false;
        if (activeInterval) {
            clearInterval(activeInterval);
            activeInterval = null;
        }
    };
    
    // Eventos para móvil (touch)
    btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const dir = btn.dataset.dir;
        startMoving(dir);
    });
    
    btn.addEventListener("touchend", (e) => {
        e.preventDefault();
        stopMoving();
    });
    
    btn.addEventListener("touchcancel", (e) => {
        e.preventDefault();
        stopMoving();
    });
    
    // Eventos para escritorio (mouse)
    btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const dir = btn.dataset.dir;
        startMoving(dir);
    });
    
    btn.addEventListener("mouseup", () => {
        stopMoving();
    });
    
    btn.addEventListener("mouseleave", () => {
        stopMoving();
    });
    
    // Prevenir arrastre accidental
    btn.addEventListener("dragstart", (e) => {
        e.preventDefault();
    });
});

function detener() {
    if (intervalo) {
        clearInterval(intervalo);
        intervalo = null;
    }
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
    
    mensaje.style.color = "lime";
    mensaje.style.textShadow = "0 0 10px lime, 0 0 20px lime";
    mensaje.style.animation = "textGlowGreen 1.5s infinite";
    
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
        mensaje.textContent = "¡HAS GANADO! Preparando sorpresa...";
        
        setTimeout(() => {
            videoLoops = 0;
            videoProtegido = true;
            
            video.onended = null;
            video.onclick = null;
            video.ontimeupdate = null;
            
            jumpscare.style.display = "block";
            mensajeVideoTop.style.display = "block";
            
            video.muted = false;
            video.volume = 1.0;
            
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log("Error al reproducir video:", e);
                    mostrarMensajeVideo();
                });
            }
            
            configurarProteccionVideo();
            
        }, 1000);
    }
}

function configurarProteccionVideo() {
    videoLoops = 0;
    videoProtegido = true;
    
    video.addEventListener('timeupdate', function() {
        if (this.currentTime > this.duration * 0.9) {
            setTimeout(() => {
                videoLoops++;
                
                if (videoLoops >= 3) {
                    videoProtegido = false;
                    mostrarBotonSalir();
                }
            }, 500);
        }
    });
    
    video.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!videoProtegido) {
            cerrarVideo();
        } else {
            mostrarMensajeProteccion();
        }
        return false;
    };
    
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
    
    document.addEventListener('keydown', function videoKeyHandler(e) {
        if (e.key === 'Escape') {
            cerrarVideo();
            document.removeEventListener('keydown', videoKeyHandler);
        }
    });
}

function mostrarBotonSalir() {
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
    video.pause();
    video.currentTime = 0;
    video.muted = true;
    videoLoops = 0;
    videoProtegido = true;
    
    mensajeVideoTop.style.display = "none";
    
    const botonSalir = document.getElementById('boton-salir');
    if (botonSalir) {
        botonSalir.parentNode.removeChild(botonSalir);
    }
    
    const mensajeProteccion = document.getElementById('mensaje-proteccion');
    if (mensajeProteccion && mensajeProteccion.parentNode) {
        mensajeProteccion.parentNode.removeChild(mensajeProteccion);
    }
    
    const mensajeVideo = document.getElementById('mensaje-video');
    if (mensajeVideo && mensajeVideo.parentNode) {
        mensajeVideo.parentNode.removeChild(mensajeVideo);
    }
    
    const greenStyle = document.getElementById('green-glow-style');
    if (greenStyle) {
        greenStyle.parentNode.removeChild(greenStyle);
    }
    
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

// Añadir pull-to-refresh simplificado
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const distance = touchEndY - touchStartY;
    
    // Pull-to-refresh si deslizas desde la parte superior
    if (window.scrollY === 0 && distance > 150) {
        location.reload();
    }
}, { passive: true });