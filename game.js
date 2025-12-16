const jugador = document.getElementById("jugador");
const meta = document.getElementById("meta");
const laberinto = document.getElementById("laberinto");
const barra = document.getElementById("barra");

let nivel = 1;
let x = 10, y = 10;
let velocidad = 2;
let moviendo = {};
let bloqueado = false;

const niveles = {
    1: [
        { x: 30, y: 20, w: 5, h: 60, roja: false },
        { x: 55, y: 10, w: 5, h: 70, roja: true },
        { x: 75, y: 20, w: 5, h: 60, roja: false }
    ],
    2: [
        { x: 20, y: 10, w: 5, h: 80, roja: true },
        { x: 40, y: 10, w: 5, h: 80, roja: false },
        { x: 60, y: 10, w: 5, h: 80, roja: true }
    ],
    3: [
        { x: 25, y: 5, w: 5, h: 85, roja: true },
        { x: 50, y: 5, w: 5, h: 85, roja: false },
        { x: 75, y: 5, w: 5, h: 85, roja: true }
    ]
};

function cargarNivel() {
    laberinto.querySelectorAll(".pared").forEach(p => p.remove());
    barra.textContent = `Nivel ${nivel}`;
    x = 10; y = 10;
    actualizarJugador();

    niveles[nivel].forEach(p => {
        const d = document.createElement("div");
        d.className = "pared" + (p.roja ? " roja" : "");
        d.style.left = p.x + "%";
        d.style.top = p.y + "%";
        d.style.width = p.w + "%";
        d.style.height = p.h + "%";
        laberinto.appendChild(d);
    });
}

function actualizarJugador() {
    jugador.style.left = x + "px";
    jugador.style.top = y + "px";
}

function colision(a, b) {
    return !(
        a.right < b.left ||
        a.left > b.right ||
        a.bottom < b.top ||
        a.top > b.bottom
    );
}

function rect(el) {
    return el.getBoundingClientRect();
}

function reiniciar() {
    x = 10; y = 10;
    actualizarJugador();
}

function avanzarNivel() {
    if (bloqueado) return;
    bloqueado = true;

    if (nivel < 3) {
        nivel++;
        cargarNivel();
    } else {
        document.getElementById("juego").classList.add("oculto");
        document.getElementById("final").classList.remove("oculto");
    }

    setTimeout(() => bloqueado = false, 1000);
}

setInterval(() => {
    if (moviendo.up) y -= velocidad;
    if (moviendo.down) y += velocidad;
    if (moviendo.left) x -= velocidad;
    if (moviendo.right) x += velocidad;

    actualizarJugador();

    laberinto.querySelectorAll(".pared").forEach(p => {
        if (colision(rect(jugador), rect(p))) {
            if (p.classList.contains("roja")) reiniciar();
            else reiniciar();
        }
    });

    if (colision(rect(jugador), rect(meta))) {
        avanzarNivel();
    }
}, 16);

/* CONTROLES */
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