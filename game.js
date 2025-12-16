const jugador = document.getElementById("jugador");
const meta = document.getElementById("meta");
const laberinto = document.getElementById("laberinto");
const barra = document.getElementById("barra");
const mensaje = document.getElementById("mensaje");

let nivel = 1;
let x = 10, y = 10;
let velocidad = 2;
let moviendo = {};
let bloqueoCambio = false;

const niveles = {
    1: [
        { x: 80, y: 20, w: 10, h: 200, roja: false }
    ],
    2: [
        { x: 60, y: 0, w: 10, h: 180, roja: true },
        { x: 120, y: 100, w: 10, h: 200, roja: false }
    ],
    3: [
        { x: 80, y: 0, w: 10, h: 300, roja: true },
        { x: 160, y: 120, w: 10, h: 200, roja: false }
    ]
};

function cargarNivel() {
    laberinto.querySelectorAll(".pared").forEach(p => p.remove());
    barra.textContent = "Nivel " + nivel;
    mensaje.textContent = "";
    x = 10; y = 10;
    actualizarJugador();

    niveles[nivel].forEach(p => {
        const d = document.createElement("div");
        d.className = "pared" + (p.roja ? " roja" : "");
        d.style.left = p.x + "px";
        d.style.top = p.y + "px";
        d.style.width = p.w + "px";
        d.style.height = p.h + "px";
        laberinto.appendChild(d);
    });
}

function actualizarJugador() {
    jugador.style.left = x + "px";
    jugador.style.top = y + "px";
}

function rect(el) {
    return el.getBoundingClientRect();
}

function colision(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function reiniciar() {
    mensaje.textContent = "Reiniciaste el nivel, no toques las paredes";
    x = 10; y = 10;
    actualizarJugador();
}

function pasarNivel() {
    if (bloqueoCambio) return;
    bloqueoCambio = true;

    mensaje.textContent = "Pasaste al nivel " + (nivel + 1);

    setTimeout(() => {
        nivel++;
        if (nivel <= 3) {
            cargarNivel();
        } else {
            document.getElementById("juego").classList.add("oculto");
            document.getElementById("final").classList.remove("oculto");
        }
        bloqueoCambio = false;
    }, 1000);
}

setInterval(() => {
    if (moviendo.up) y -= velocidad;
    if (moviendo.down) y += velocidad;
    if (moviendo.left) x -= velocidad;
    if (moviendo.right) x += velocidad;

    actualizarJugador();

    laberinto.querySelectorAll(".pared").forEach(p => {
        if (colision(rect(jugador), rect(p))) {
            reiniciar();
        }
    });

    if (colision(rect(jugador), rect(meta))) {
        pasarNivel();
    }
}, 16);

/* CONTROLES TÁCTILES */
document.querySelectorAll(".btn").forEach(btn => {
    const d = btn.dataset.dir;
    btn.addEventListener("touchstart", e => { e.preventDefault(); moviendo[d] = true; });
    btn.addEventListener("touchend", () => moviendo[d] = false);
    btn.addEventListener("mousedown", () => moviendo[d] = true);
    btn.addEventListener("mouseup", () => moviendo[d] = false);
});

/* TECLADO */
window.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") moviendo.up = true;
    if (e.key === "ArrowDown") moviendo.down = true;
    if (e.key === "ArrowLeft") moviendo.left = true;
    if (e.key === "ArrowRight") moviendo.right = true;
});
window.addEventListener("keyup", e => {
    if (e.key === "ArrowUp") moviendo.up = false;
    if (e.key === "ArrowDown") moviendo.down = false;
    if (e.key === "ArrowLeft") moviendo.left = false;
    if (e.key === "ArrowRight") moviendo.right = false;
});

/* INICIO */
document.getElementById("btnIniciar").onclick = () => {
    document.getElementById("bienvenida").classList.add("oculto");
    document.getElementById("juego").classList.remove("oculto");
    cargarNivel();
};