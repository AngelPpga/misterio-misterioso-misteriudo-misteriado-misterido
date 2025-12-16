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

/* DEFINICIÓN DE NIVELES — TODO DENTRO DEL CUADRO 100×100 */
const niveles = {
    1: [
        { x: 15, y: 10, w: 6, h: 60, roja: false },   // vertical
        { x: 70, y: 10, w: 6, h: 65, roja: false }    // vertical
    ],

    2: [
        { x: 15, y: 10, w: 6, h: 60, roja: true },     // vertical roja
        { x: 55, y: 15, w: 6, h: 70, roja: false },   // vertical
        { x: 10, y: 70, w: 80, h: 6, roja: true }     // horizontal roja
    ],

    3: [
        { x: 20, y: 5, w: 6, h: 90, roja: true },     // vertical roja
        { x: 47, y: 5, w: 6, h: 90, roja: false },    // vertical
        { x: 74, y: 5, w: 6, h: 90, roja: true }      // vertical roja
    ]
};

// Agrega estos parámetros para un mejor manejo de colisiones
const jugadorAncho = 4; // % del ancho del jugador
const jugadorAlto = 4;  // % del alto del jugador

btnInicio.onclick = () => {
    inicio.style.display = "none";
    bloqueado = false;
    cargarNivel();
};

function cargarNivel() {
    document.querySelectorAll(".pared, .pared-roja").forEach(p => p.remove());

    niveles[nivel].forEach(p => {
        const pared = document.createElement("div");
        pared.className = p.roja ? "pared-roja" : "pared";
        Object.assign(pared.style, {
            left: p.x + "%",
            top: p.y + "%",
            width: p.w + "%",
            height: p.h + "%"
        });
        laberinto.appendChild(pared);
    });

    reiniciarJugador();
    mensaje.textContent = "Nivel " + nivel;
    puedePasar = true;
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
document.addEventListener("keydown", e => teclas[e.key] = true);
document.addEventListener("keyup", e => teclas[e.key] = false);

setInterval(() => {
    if (bloqueado) return;
    if (teclas["ArrowUp"]) mover(0, -paso);
    if (teclas["ArrowDown"]) mover(0, paso);
    if (teclas["ArrowLeft"]) mover(-paso, 0);
    if (teclas["ArrowRight"]) mover(paso, 0);
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

    // Verificar límites del laberinto (0-95 para dejar espacio al jugador)
    if (nuevoX < 0 || nuevoY < 0 || nuevoX > 96 || nuevoY > 96) {
        reinicioPorError();
        return;
    }

    // Verificar colisiones ANTES de mover
    const colisiona = verificarColision(nuevoX, nuevoY);
    
    if (colisiona) {
        reinicioPorError();
        return;
    }

    // Solo mover si no hay colisión
    x = nuevoX;
    y = nuevoY;
    actualizarJugador();

    // Verificar si llegó a la meta
    if (puedePasar && colision("#meta")) {
        pasarNivel();
    }
}

// Función mejorada para verificar colisiones
function verificarColision(posX, posY) {
    // Simular la posición del jugador
    const jLeft = posX;
    const jRight = posX + jugadorAncho;
    const jTop = posY;
    const jBottom = posY + jugadorAlto;

    // Verificar colisiones con paredes
    for (const pared of niveles[nivel]) {
        const pLeft = pared.x;
        const pRight = pared.x + pared.w;
        const pTop = pared.y;
        const pBottom = pared.y + pared.h;

        // Si es pared roja y puedePasar es true, no colisiona
        if (pared.roja && puedePasar) {
            continue;
        }

        // Verificar colisión
        if (jLeft < pRight &&
            jRight > pLeft &&
            jTop < pBottom &&
            jBottom > pTop) {
            return true; // Hay colisión
        }
    }
    
    return false; // No hay colisión
}

function colision(selector) {
    const j = jugador.getBoundingClientRect();
    const m = meta.getBoundingClientRect();
    
    return !(j.right < m.left || 
             j.left > m.right || 
             j.bottom < m.top || 
             j.top > m.bottom);
}

function reinicioPorError() {
    mensaje.textContent = "Haz reiniciado el nivel, no toques las paredes";
    reiniciarJugador();
}

function pasarNivel() {
    puedePasar = false;
    bloqueado = true;
    nivel++;

    if (nivel <= 3) {
        mensaje.textContent = "Pasaste al nivel " + nivel;
        setTimeout(() => {
            bloqueado = false;
            cargarNivel();
        }, 1200);
    } else {
        jumpscare.style.display = "block";
        video.play();
    }
}