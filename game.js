const laberinto = document.getElementById("laberinto");
const jugador = document.getElementById("jugador");
const meta = document.getElementById("meta");
const mensaje = document.getElementById("mensaje");
const inicio = document.getElementById("inicio");
const btnInicio = document.getElementById("btnInicio");
const jumpscare = document.getElementById("jumpscare");
const video = document.getElementById("videoFinal");

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

/* DEFINICIÓN DE NIVELES - META MÁS DIFÍCIL */
const niveles = {
    1: [
        // NIVEL 1: 1 roja, 2 grises - Meta dificil
        { x: 35, y: 25, w: 6, h: 50, roja: true },    // Pared roja central
        { x: 15, y: 40, w: 20, h: 5, roja: false },   // Pared gris superior
        { x: 65, y: 55, w: 20, h: 5, roja: false }    // Pared gris inferior
    ],

    2: [
        // NIVEL 2: 2 rojas, 1 gris - Meta más dificil
        { x: 25, y: 20, w: 6, h: 60, roja: true },    // Pared roja izquierda
        { x: 65, y: 20, w: 6, h: 60, roja: true },    // Pared roja derecha
        { x: 40, y: 35, w: 20, h: 5, roja: false }    // Pared gris central
    ],

    3: [
        // NIVEL 3: 3 rojas - Meta MUY dificil
        { x: 20, y: 15, w: 5, h: 70, roja: true },    // Pared roja izquierda
        { x: 45, y: 15, w: 5, h: 70, roja: true },    // Pared roja centro
        { x: 70, y: 15, w: 5, h: 70, roja: true }     // Pared roja derecha
    ]
};

const jugadorAncho = 4;
const jugadorAlto = 4;

// PRECARGAR EL VIDEO PARA QUE SEA INSTANTÁNEO
function precargarVideo() {
    video.load();
    video.muted = true;
    video.preload = "auto";
}

precargarVideo();

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
    mensaje.textContent = `Nivel ${nivel}`;
    puedePasar = true;
}

function reposicionarMeta() {
    // META MÁS DIFÍCIL DE ALCANZAR
    switch(nivel) {
        case 1:
            // Meta en esquina superior derecha entre paredes
            meta.style.left = "88%";
            meta.style.top = "10%";
            break;
        case 2:
            // Meta en esquina inferior izquierda, difícil acceso
            meta.style.left = "5%";
            meta.style.top = "88%";
            break;
        case 3:
            // Meta MUY difícil - en el centro derecho entre 3 paredes
            meta.style.left = "88%";
            meta.style.top = "45%";
            break;
    }
    
    // Hacer la meta más pequeña
    meta.style.width = "4.5%";
    meta.style.height = "4.5%";
}

function reiniciarJugador() {
    // Posición inicial también más desafiante
    x = 2;
    y = 2;
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

// Loop de movimiento más rápido
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
}, 30); // Más rápido

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
        }, 30); // Más rápido
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
    
    // Colisión más precisa con meta pequeña
    const colisiona = !(jugadorRect.right < metaRect.left + 5 || 
                       jugadorRect.left > metaRect.right - 5 || 
                       jugadorRect.bottom < metaRect.top + 5 || 
                       jugadorRect.top > metaRect.bottom - 5);
    
    if (colisiona && puedePasar) {
        pasarNivel();
    }
}

function reinicioPorError(mensajeError) {
    mensaje.textContent = mensajeError;
    
    // Feedback visual más sutil
    mensaje.style.color = "red";
    setTimeout(() => {
        mensaje.style.color = "red";
    }, 1000);
    
    reiniciarJugador();
    
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
}

function pasarNivel() {
    puedePasar = false;
    bloqueado = true;
    
    // Feedback positivo
    mensaje.textContent = `¡Nivel ${nivel} completado!`;
    mensaje.style.color = "lime";
    
    meta.style.transform = "scale(1.5)";
    meta.style.boxShadow = "0 0 25px yellow";
    
    if (nivel < 3) {
        // Cambio de nivel instantáneo
        setTimeout(() => {
            nivel++;
            bloqueado = false;
            mensaje.style.color = "red";
            cargarNivel();
        }, 400); // Muy rápido
    } else {
        // Nivel 3 completado - Mostrar video INSTANTÁNEAMENTE
        setTimeout(() => {
            mostrarVideoFinal();
        }, 300);
    }
}

function mostrarVideoFinal() {
    // Resetear contadores
    videoLoops = 0;
    videoProtegido = true;
    
    // Ocultar todo y mostrar video instantáneamente
    document.querySelector("#game-container").style.display = "none";
    jumpscare.style.display = "block";
    
    // Activar sonido y reproducir
    video.muted = false;
    video.volume = 1.0;
    video.currentTime = 0;
    
    // Forzar reproducción inmediata
    const playVideo = () => {
        video.play().catch(e => {
            console.log("Intentando reproducir video...");
            // Si falla, esperar y reintentar
            setTimeout(() => {
                video.muted = false;
                video.play();
            }, 100);
        });
    };
    
    playVideo();
    
    // Configurar protección
    configurarProteccionVideo();
}

function configurarProteccionVideo() {
    // Detectar loops del video
    video.addEventListener('timeupdate', function() {
        if (this.currentTime > this.duration * 0.95 && this.duration > 0) {
            setTimeout(() => {
                videoLoops++;
                console.log(`Loop ${videoLoops} completado`);
                
                if (videoLoops >= 3) {
                    videoProtegido = false;
                    mostrarBotonSalir();
                }
            }, 300);
        }
    });
    
    // Controlar clicks
    video.onclick = jumpscare.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!videoProtegido) {
            cerrarVideo();
        } else {
            mostrarMensajeProteccion();
        }
        return false;
    };
    
    // Tecla Escape siempre funciona
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
        botonSalir.innerHTML = 'SALIR';
        botonSalir.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: red;
            color: white;
            border: none;
            padding: 12px 25px;
            font-size: 16px;
            border-radius: 8px;
            cursor: pointer;
            z-index: 40;
            box-shadow: 0 0 15px rgba(255, 0, 0, 0.8);
            animation: pulse 1s infinite;
        `;
        document.body.appendChild(botonSalir);
        
        botonSalir.onclick = function(e) {
            e.preventDefault();
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
        mensajeProteccion.innerHTML = 'Espera...<br>El video se repetirá 3 veces';
        mensajeProteccion.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            z-index: 35;
            border: 2px solid red;
            font-size: 14px;
            animation: fadeInOut 2s forwards;
        `;
        document.body.appendChild(mensajeProteccion);
        
        setTimeout(() => {
            if (mensajeProteccion.parentNode) {
                mensajeProteccion.parentNode.removeChild(mensajeProteccion);
            }
        }, 2000);
    }
}

function cerrarVideo() {
    video.pause();
    video.currentTime = 0;
    video.muted = true;
    videoLoops = 0;
    videoProtegido = true;
    
    // Limpiar elementos
    const botonSalir = document.getElementById('boton-salir');
    if (botonSalir) botonSalir.remove();
    
    const mensajeProteccion = document.getElementById('mensaje-proteccion');
    if (mensajeProteccion) mensajeProteccion.remove();
    
    // Volver al juego
    jumpscare.style.display = "none";
    document.querySelector("#game-container").style.display = "flex";
    nivel = 1;
    inicio.style.display = "flex";
    bloqueado = true;
    mensaje.textContent = "¡Juego completado!";
    mensaje.style.color = "red";
}

// Añadir animación CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { opacity: 0; }
    }
    
    @keyframes pulse {
        0% { transform: translateX(-50%) scale(1); }
        50% { transform: translateX(-50%) scale(1.05); }
        100% { transform: translateX(-50%) scale(1); }
    }
`;
document.head.appendChild(style);

// Inicializar
video.muted = true;
video.loop = true;
video.preload = "auto";
video.addEventListener('contextmenu', e => e.preventDefault());

mensaje.textContent = "Presiona 'Comenzar Juego'";