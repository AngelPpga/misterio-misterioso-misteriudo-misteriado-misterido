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