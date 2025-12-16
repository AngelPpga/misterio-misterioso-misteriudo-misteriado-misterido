const laberinto = document.getElementById("laberinto");
const jugador = document.getElementById("jugador");
const meta = document.getElementById("meta");
const mensaje = document.getElementById("mensaje");
const jumpscare = document.getElementById("jumpscare");
const sonido = document.getElementById("sonido");

let x = 10;
let y = 10;
let nivel = 1;
const paso = 10;

const niveles = {
    1: [
        { x: 50, y: 0, w: 20, h: 300 },
        { x: 100, y: 100, w: 200, h: 20 },
        { x: 250, y: 200, w: 20, h: 200 }
    ],
    2: [
        { x: 80, y: 0, w: 20, h: 250 },
        { x: 160, y: 150, w: 20, h: 250 },
        { x: 240, y: 0, w: 20, h: 250 },
        { x: 0, y: 300, w: 300, h: 20 }
    ],
    3: [
        { x: 60, y: 0, w: 20, h: 350 },
        { x: 140, y: 50, w: 20, h: 350 },
        { x: 220, y: 0, w: 20, h: 350 },
        { x: 300, y: 50, w: 20, h: 350 }
    ]
};

function cargarNivel() {
    document.querySelectorAll(".pared").forEach(p => p.remove());

    niveles[nivel].forEach(p => {
        const pared = document.createElement("div");
        pared.className = "pared";
        pared.style.left = p.x + "px";
        pared.style.top = p.y + "px";
        pared.style.width = p.w + "px";
        pared.style.height = p.h + "px";
        laberinto.appendChild(pared);
    });

    x = 10;
    y = 10;
    jugador.style.left = x + "px";
    jugador.style.top = y + "px";

    mensaje.textContent = "Nivel " + nivel;
}

document.addEventListener("keydown", e => {
    if (nivel > 3) return;
    if (e.key === "ArrowUp") mover(0, -paso);
    if (e.key === "ArrowDown") mover(0, paso);
    if (e.key === "ArrowLeft") mover(-paso, 0);
    if (e.key === "ArrowRight") mover(paso, 0);
});

function moverTouch(dir) {
    if (dir === "up") mover(0, -paso);
    if (dir === "down") mover(0, paso);
    if (dir === "left") mover(-paso, 0);
    if (dir === "right") mover(paso, 0);
}

function mover(dx, dy) {
    const nuevoX = x + dx;
    const nuevoY = y + dy;

    if (nuevoX < 0 || nuevoY < 0 || nuevoX > 380 || nuevoY > 380) return;

    const temp = jugador.getBoundingClientRect();
    jugador.style.left = nuevoX + "px";
    jugador.style.top = nuevoY + "px";

    if (colisionPared()) {
        mensaje.textContent = "💀 Volviste al inicio";
        x = 10;
        y = 10;
        jugador.style.left = x + "px";
        jugador.style.top = y + "px";
        return;
    }

    x = nuevoX;
    y = nuevoY;

    verificarMeta();
}

function colisionPared() {
    const j = jugador.getBoundingClientRect();
    return [...document.querySelectorAll(".pared")].some(p => {
        const r = p.getBoundingClientRect();
        return j.left < r.right && j.right > r.left &&
               j.top < r.bottom && j.bottom > r.top;
    });
}

function verificarMeta() {
    const j = jugador.getBoundingClientRect();
    const m = meta.getBoundingClientRect();

    if (j.left < m.right && j.right > m.left &&
        j.top < m.bottom && j.bottom > m.top) {
        pasarNivel();
    }
}

function pasarNivel() {
    nivel++;
    if (nivel <= 3) {
        mensaje.textContent = "Pasaste al nivel " + nivel;
        setTimeout(cargarNivel, 1000);
    } else {
        finalTerror();
    }
}

function finalTerror() {
    mensaje.textContent = "💀";
    jumpscare.style.display = "flex";
    sonido.play();
}

cargarNivel();