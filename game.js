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
        // NIVEL 1: 1 pared roja (horizontal en el centro)
        { x: 30, y: 40, w: 40, h: 5, roja: true }
    ],

    2: [
        // NIVEL 2: 2 paredes rojas (forma de L)
        { x: 30, y: 30, w: 5, h: 40, roja: true },
        { x: 30, y: 65, w: 40, h: 5, roja: true }
    ],

    3: [
        // NIVEL 3: 3 paredes rojas (laberinto simple)
        { x: 20, y: 20, w: 5, h: 60, roja: true },
        { x: 40, y: 30, w: 40, h: 5, roja: true },
        { x: 70, y: 40, w: 5, h: 40, roja: true }
    ]
};

// Dimensiones del jugador
const jugadorAncho = 3;
const jugadorAlto = 3;

btnInicio.onclick = () => {
    inicio.style.display = "none";
    bloqueado = false;
    cargarNivel();
};

function cargarNivel() {
    // Limpiar paredes anteriores
    document.querySelectorAll(".pared, .pared-roja").forEach(p => p.remove());

    // Crear nuevas paredes
    niveles[nivel].forEach(p => {
        const pared = document.createElement("div");
        pared.className = "pared-roja"; // Todas son rojas
        Object.assign(pared.style, {
            left: p.x + "%",
            top: p.y + "%",
            width: p.w + "%",
            height: p.h + "%",
            position: "absolute",
            backgroundColor: "red",
            border: "1px solid darkred"
        });
        laberinto.appendChild(pared);
    });

    // Posicionar meta según el nivel
    reposicionarMeta();
    
    reiniciarJugador();
    mensaje.textContent = "Nivel " + nivel;
    puedePasar = true;
}

function reposicionarMeta() {
    switch(nivel) {
        case 1:
            meta.style.left = "90%";
            meta.style.top = "90%";
            break;
        case 2:
            meta.style.left = "85%";
            meta.style.top = "85%";
            break;
        case 3:
            meta.style.left = "92%";
            meta.style.top = "10%";
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
}, 40);

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
        }, 40);
    });

    btn.addEventListener("pointerup", detener);
    btn.addEventListener("pointerleave", detener);
});

function detener() {
    clearInterval(intervalo);
    intervalo = null;
}

/* MOVIMIENTO - FUNCIÓN CORREGIDA */
function mover(dx, dy) {
    const nuevoX = x + dx;
    const nuevoY = y + dy;

    // Verificar límites del laberinto
    if (nuevoX < 0 || nuevoY < 0 || nuevoX > 97 || nuevoY > 97) {
        reinicioPorError();
        return;
    }

    // Verificar colisiones con paredes
    if (hayColision(nuevoX, nuevoY)) {
        reinicioPorError();
        return;
    }

    // Mover si no hay colisión
    x = nuevoX;
    y = nuevoY;
    actualizarJugador();

    // Verificar colisión con la meta - ¡FUNCIÓN SIMPLIFICADA QUE SÍ FUNCIONA!
    verificarColisionMeta();
}

function hayColision(posX, posY) {
    const jLeft = posX;
    const jRight = posX + jugadorAncho;
    const jTop = posY;
    const jBottom = posY + jugadorAlto;

    for (const pared of niveles[nivel]) {
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

// ¡FUNCIÓN NUEVA Y MEJOR PARA DETECTAR LA META!
function verificarColisionMeta() {
    // Obtener posición actual del jugador
    const jugadorRect = jugador.getBoundingClientRect();
    const metaRect = meta.getBoundingClientRect();
    
    // Verificar colisión simple
    const colisiona = !(jugadorRect.right < metaRect.left || 
                       jugadorRect.left > metaRect.right || 
                       jugadorRect.bottom < metaRect.top || 
                       jugadorRect.top > metaRect.bottom);
    
    if (colisiona && puedePasar) {
        pasarNivel();
    }
}

function reinicioPorError() {
    mensaje.textContent = "¡Tocaste una pared! Reiniciando nivel " + nivel;
    reiniciarJugador();
    
    // Pequeña vibración para feedback
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
}

function pasarNivel() {
    puedePasar = false;
    bloqueado = true;
    
    mensaje.textContent = "¡Nivel " + nivel + " completado! 🎉";
    
    // Pequeña animación visual
    meta.style.transform = "scale(1.5)";
    meta.style.transition = "transform 0.5s";
    
    setTimeout(() => {
        meta.style.transform = "scale(1)";
        
        nivel++;
        
        if (nivel <= 3) {
            setTimeout(() => {
                mensaje.textContent = "Cargando nivel " + nivel + "...";
                setTimeout(() => {
                    bloqueado = false;
                    cargarNivel();
                }, 800);
            }, 800);
        } else {
            // Juego completado
            mensaje.textContent = "¡FELICIDADES! ¡GANASTE LA ANCHETA! 🎁";
            setTimeout(() => {
                jumpscare.style.display = "block";
                video.play();
                
                // Cuando termine el video, volver al inicio
                video.onended = function() {
                    jumpscare.style.display = "none";
                    inicio.style.display = "flex";
                    nivel = 1;
                    puedePasar = true;
                    bloqueado = true;
                    mensaje.textContent = "¡Juego completado! Presiona 'Comenzar' para jugar otra vez";
                };
            }, 2000);
        }
    }, 500);
}

// Inicializar
mensaje.textContent = "Presiona 'Comenzar Juego' para iniciar";