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

// =======================
// NUEVAS PAREDES POR NIVEL
// =======================

const levels = {
    1: [
        { x: 40,  y: 0,   w: 20, h: 260 },   // pared vertical izquierda
        { x: 120, y: 120, w: 160, h: 20 },   // pared horizontal centro
        { x: 260, y: 160, w: 20,  h: 140 }   // pared vertical derecha
    ],

    2: [
        { x: 80,  y: 0,   w: 20, h: 240 },   // izquierda
        { x: 160, y: 80,  w: 20, h: 240 },   // centro
        { x: 240, y: 0,   w: 20, h: 240 }    // derecha
    ],

    3: [
        { x: 40, y: 20,  w: 20, h: 220 },    // izquierda
        { x: 140, y: 0,  w: 20, h: 260 },    // centro
        { x: 240, y: 40, w: 20, h: 220 }     // derecha
    ]
};



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

/* MOVIMIENTO */
function mover(dx, dy) {
    x += dx;
    y += dy;

    if (x < 0 || y < 0 || x > 95 || y > 95) {
        reinicioPorError();
        return;
    }

    actualizarJugador();

    if (colision(".pared") || colision(".pared-roja")) {
        reinicioPorError();
    }

    if (puedePasar && colision("#meta")) {
        pasarNivel();
    }
}

function reinicioPorError() {
    mensaje.textContent = "Haz reiniciado el nivel, no toques las paredes";
    reiniciarJugador();
}

function colision(selector) {
    const j = jugador.getBoundingClientRect();
    return [...document.querySelectorAll(selector)].some(el => {
        const r = el.getBoundingClientRect();
        return j.left < r.right &&
               j.right > r.left &&
               j.top < r.bottom &&
               j.bottom > r.top;
    });
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