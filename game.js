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

/* DEFINICIÓN DE NIVELES - CONFIGURACIÓN MEJORADA */
const niveles = {
    1: [
        // NIVEL 1: 1 pared roja, 2 grises
        { x: 40, y: 20, w: 5, h: 60, roja: true },   // Pared roja vertical central
        { x: 20, y: 30, w: 15, h: 5, roja: false },  // Pared gris horizontal superior
        { x: 65, y: 60, w: 15, h: 5, roja: false }   // Pared gris horizontal inferior
    ],

    2: [
        // NIVEL 2: 2 paredes rojas, 1 gris
        { x: 30, y: 25, w: 5, h: 50, roja: true },   // Pared roja vertical izquierda
        { x: 60, y: 25, w: 5, h: 50, roja: true },   // Pared roja vertical derecha
        { x: 45, y: 40, w: 10, h: 5, roja: false }   // Pared gris central
    ],

    3: [
        // NIVEL 3: 3 paredes rojas, meta difícil
        { x: 25, y: 20, w: 5, h: 70, roja: true },   // Pared roja izquierda
        { x: 50, y: 10, w: 5, h: 70, roja: true },   // Pared roja centro
        { x: 75, y: 20, w: 5, h: 70, roja: true }    // Pared roja derecha
    ]
};

// Dimensiones del jugador
const jugadorAncho = 4;
const jugadorAlto = 4;

btnInicio.onclick = () => {
    inicio.style.display = "none";
    bloqueado = false;
    cargarNivel();
};

function cargarNivel() {
    // Limpiar paredes anteriores
    document.querySelectorAll(".pared-roja, .pared-gris").forEach(p => p.remove());

    // Crear nuevas paredes
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

    // Posicionar meta según el nivel
    reposicionarMeta();
    
    reiniciarJugador();
    mensaje.textContent = `Nivel ${nivel} - Escapa del laberinto!`;
    puedePasar = true;
    
    // Asegurar que el video esté silenciado inicialmente
    video.muted = true;
}

function reposicionarMeta() {
    switch(nivel) {
        case 1:
            // Meta fácil - esquina inferior derecha
            meta.style.left = "90%";
            meta.style.top = "90%";
            break;
        case 2:
            // Meta media - centro derecha
            meta.style.left = "85%";
            meta.style.top = "50%";
            break;
        case 3:
            // Meta difícil - esquina superior derecha entre paredes
            meta.style.left = "92%";
            meta.style.top = "15%";
            break;
    }
}

function reiniciarJugador() {
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
}, 35); // Más rápido

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
        }, 35); // Más rápido
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

    // Verificar límites del laberinto
    if (nuevoX < 0 || nuevoY < 0 || nuevoX > 96 || nuevoY > 96) {
        reinicioPorError("¡Saliste del laberinto!");
        return;
    }

    // Verificar colisiones con paredes
    const colisionRoja = hayColision(nuevoX, nuevoY, true);
    const colisionGris = hayColision(nuevoX, nuevoY, false);
    
    // Si choca con pared roja, reinicia
    if (colisionRoja) {
        reinicioPorError("¡Tocaste una pared roja!");
        return;
    }
    
    // Si choca con pared gris, bloquea el movimiento pero no reinicia
    if (colisionGris) {
        return; // No se mueve, pero no reinicia
    }

    // Mover si no hay colisión
    x = nuevoX;
    y = nuevoY;
    actualizarJugador();

    // Verificar colisión con la meta
    verificarColisionMeta();
}

function hayColision(posX, posY, soloRojas) {
    const jLeft = posX;
    const jRight = posX + jugadorAncho;
    const jTop = posY;
    const jBottom = posY + jugadorAlto;

    for (const pared of niveles[nivel]) {
        // Si soloRojas es true y la pared no es roja, saltar
        if (soloRojas && !pared.roja) continue;
        // Si soloRojas es false y la pared es roja, saltar
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
    
    // Feedback visual rojo
    document.body.style.backgroundColor = "darkred";
    setTimeout(() => {
        document.body.style.backgroundColor = "black";
    }, 300);
    
    reiniciarJugador();
    
    // Vibración en móviles
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
}

function pasarNivel() {
    puedePasar = false;
    bloqueado = true;
    
    // Feedback visual verde
    document.body.style.backgroundColor = "darkgreen";
    setTimeout(() => {
        document.body.style.backgroundColor = "black";
    }, 300);
    
    // Efecto en la meta
    meta.style.transform = "scale(1.3)";
    meta.style.boxShadow = "0 0 30px yellow";
    
    if (nivel < 3) {
        mensaje.textContent = `¡Nivel ${nivel} completado! Pasando al siguiente...`;
        
        // Cambio de nivel más rápido (500ms)
        setTimeout(() => {
            nivel++;
            bloqueado = false;
            cargarNivel();
        }, 500);
    } else {
        // Nivel 3 completado
        mensaje.textContent = "¡HAS GANADO! Preparando sorpresa...";
        
        // Mostrar video con sonido después de 1 segundo
        setTimeout(() => {
            jumpscare.style.display = "block";
            video.muted = false; // ACTIVAR SONIDO
            video.volume = 1.0; // VOLUMEN AL MÁXIMO
            video.play().catch(e => {
                console.log("Error al reproducir video:", e);
                // Si falla, intentar con interacción del usuario
                video.muted = false;
                video.play();
            });
            
            // Cuando termine el video, volver al inicio
            video.onended = function() {
                jumpscare.style.display = "none";
                video.currentTime = 0;
                video.muted = true;
                nivel = 1;
                inicio.style.display = "flex";
                bloqueado = true;
                mensaje.textContent = "¡Juego completado! Presiona 'Comenzar' para jugar otra vez";
            };
            
            // También permitir reinicio al tocar el video
            video.onclick = function() {
                jumpscare.style.display = "none";
                video.pause();
                video.currentTime = 0;
                video.muted = true;
                nivel = 1;
                inicio.style.display = "flex";
                bloqueado = true;
                mensaje.textContent = "¡Juego completado! Presiona 'Comenzar' para jugar otra vez";
            };
        }, 1000);
    }
}

// Inicializar el video correctamente
video.muted = true; // Inicialmente silenciado
video.loop = true; // Repetir en bucle

// Prevenir comportamiento por defecto del video
video.addEventListener('contextmenu', e => e.preventDefault());

// Inicializar mensaje
mensaje.textContent = "Presiona 'Comenzar Juego' para iniciar";