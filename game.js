const laberinto = document.getElementById("laberinto");
const jugador = document.getElementById("jugador");
const meta = document.getElementById("meta");
const mensaje = document.getElementById("mensaje");
const jumpscare = document.getElementById("jumpscare");
const sonido = document.getElementById("sonido");

let nivel = 1;
let bloqueado = false; // 🔴 BLOQUEA MULTIPLES PASOS

let x = 2;
let y = 2;
const paso = 3;

const niveles = {
    1: [
        { x: 20, y: 0, w: 5, h: 70 },
        { x: 40, y: 30, w: 40, h: 5 }
    ],
    2: [
        { x: 25, y: 0, w: 5, h: 60 },
        { x: 50, y: 20, w: 5, h: 80 },
        { x: 0, y: 70, w: 60, h: 5 }
    ],
    3: [
        { x: 20, y: 0, w: 5, h: 90 },
        { x: 45, y: 10, w: 5, h: 90 },
        { x: 70, y: 0, w: 5, h: 90 }
    ]
};

function cargarNivel() {
    bloqueado = false;

    document.querySelectorAll(".pared").forEach(p => p.remove());

    niveles[nivel].forEach(p => {
        const pared = document.createElement("div");
        pared.className = "pared";
        pared.style.left = p.x + "%";
        pared.style.top = p.y + "%";
        pared.style.width = p.w + "%";
        pared.style.height = p.h + "%";
        laberinto.appendChild(pared);
    });

    x = 2;
    y = 2;
    moverJugador();
    mensaje.textContent = "Nivel " + nivel;
}

function moverJugador() {
    jugador.style.left = x + "%";
    jugador.style.top = y + "%";
}

document.addEventListener("keydown", e => {
    if (bloqueado) return;

    if (e.key === "ArrowUp") mover(0, -paso);
    if (e.key === "ArrowDown") mover(0, paso);
    if (e.key === "ArrowLeft") mover(-paso, 0);
    if (e.key === "ArrowRight") mover(paso, 0);
});

document.querySelectorAll("#controles button").forEach(btn => {
    btn.addEventListener("touchstart", e => {
        e.preventDefault();
        if (bloqueado) return;

        const dir = btn.dataset.dir;
        if (dir === "up") mover(0, -paso);
        if (dir === "down") mover(0, paso);
        if (dir === "left") mover(-paso, 0);
        if (dir === "right") mover(paso, 0);
    });
});

function mover(dx, dy) {
    const nx = x + dx;
    const ny = y + dy;

    if (nx < 0 || ny < 0 || nx > 95 || ny > 95) return;

    x = nx;
    y = ny;
    moverJugador();

    if (colision(".pared")) {
        mensaje.textContent = "💀 Reinicio";
        x = 2;
        y = 2;
        moverJugador();
    }

    if (colision("#meta")) {
        pasarNivel();
    }
}

function colision(selector) {
    const j = jugador.getBoundingClientRect();
    return [...document.querySelectorAll(selector)].some(el => {
        const r = el.getBoundingClientRect();
        return j.left < r.right && j.right > r.left &&
               j.top < r.bottom && j.bottom > r.top;
    });
}

function pasarNivel() {
    if (bloqueado) return;

    bloqueado = true;
    nivel++;

    if (nivel <= 3) {
        mensaje.textContent = "Nivel superado";
        setTimeout(cargarNivel, 1200);
    } else {
        mensaje.textContent = "💀";
        jumpscare.style.display = "flex";
        sonido.play();
    }
}

cargarNivel();