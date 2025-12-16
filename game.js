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
        { x: 30, y: 40, w: 40, h: 5, roja: true }   // Pared roja horizontal en el centro
    ],

    2: [
        // NIVEL 2: 2 paredes rojas (forma de L)
        { x: 30, y: 30, w: 5, h: 40, roja: true },  // Vertical izquierda
        { x: 30, y: 65, w: 40, h: 5, roja: true }   // Horizontal abajo
    ],

    3: [
        // NIVEL 3: 3 paredes rojas (laberinto simple)
        { x: 20, y: 20, w: 5, h: 60, roja: true },  // Vertical izquierda
        { x: 40, y: 30, w: 40, h: 5, roja: true },  // Horizontal centro
        { x: 70, y: 40, w: 5, h: 40, roja: true }   // Vertical derecha
    ]
};

// Dimensiones del jugador (más pequeñas para mejor maniobrabilidad)
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
        pared.className = p.roja ? "pared-roja" : "pared";
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
    mensaje.textContent = "Nivel " + nivel;
    puedePasar = true;
}

function reposicionarMeta() {
    // Posicionar la meta en diferentes lugares según el nivel
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
    // Posición inicial del jugador (esquina superior izquierda)
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

    // Verificar colisiones
    if (hayColision(nuevoX, nuevoY)) {
        reinicioPorError();
        return;
    }

    // Mover si no hay colisión
    x = nuevoX;
    y = nuevoY;
    actualizarJugador();

    // Verificar si llegó a la meta
    if (verificarMeta()) {
        pasarNivel();
    }
}

function hayColision(posX, posY) {
    // Área del jugador
    const jLeft = posX;
    const jRight = posX + jugadorAncho;
    const jTop = posY;
    const jBottom = posY + jugadorAlto;

    // Verificar colisiones con todas las paredes del nivel actual
    for (const pared of niveles[nivel]) {
        const pLeft = pared.x;
        const pRight = pared.x + pared.w;
        const pTop = pared.y;
        const pBottom = pared.y + pared.h;

        // Todas las paredes son rojas y deben causar reinicio
        // (eliminamos la condición de puedePasar ya que todas son rojas)
        if (jLeft < pRight &&
            jRight > pLeft &&
            jTop < pBottom &&
            jBottom > pTop) {
            return true; // Hay colisión
        }
    }
    
    return false; // No hay colisión
}

function verificarMeta() {
    const jLeft = x;
    const jRight = x + jugadorAncho;
    const jTop = y;
    const jBottom = y + jugadorAlto;
    
    // Obtener posición de la meta
    const metaStyle = window.getComputedStyle(meta);
    const mLeft = parseFloat(metaStyle.left);
    const mTop = parseFloat(metaStyle.top);
    const mWidth = parseFloat(metaStyle.width);
    const mHeight = parseFloat(metaStyle.height);
    
    const mRight = mLeft + mWidth;
    const mBottom = mTop + mHeight;
    
    // Verificar colisión con la meta
    return !(jRight < mLeft || 
             jLeft > mRight || 
             jBottom < mTop || 
             jTop > mBottom);
}

function reinicioPorError() {
    mensaje.textContent = "¡Tocaste una pared! Reiniciando nivel " + nivel;
    reiniciarJugador();
}

function pasarNivel() {
    puedePasar = false;
    bloqueado = true;
    
    mensaje.textContent = "¡Nivel " + nivel + " completado!";
    
    setTimeout(() => {
        nivel++;
        
        if (nivel <= 3) {
            mensaje.textContent = "Cargando nivel " + nivel + "...";
            setTimeout(() => {
                bloqueado = false;
                cargarNivel();
            }, 1000);
        } else {
            // Juego completado
            mensaje.textContent = "¡Juego Completado!";
            setTimeout(() => {
                jumpscare.style.display = "block";
                video.play();
            }, 1500);
        }
    }, 1000);
}

// Inicializar
cargarNivel();