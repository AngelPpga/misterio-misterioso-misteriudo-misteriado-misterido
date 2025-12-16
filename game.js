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
let intervalo = null;

/* NIVELES */
const niveles = {
    1: [
        { x: 20, y: 0, w: 5, h: 70 },
        { x: 45, y: 20, w: 5, h: 60 },
        { x: 60, y: 40, w: 20, h: 5 } // pared pequeña nueva
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

btnInicio.onclick = () => {
    inicio.style.display = "none";
    bloqueado = false;
    cargarNivel();
};

function cargarNivel() {
    document.querySelectorAll(".pared").forEach(p => p.remove());
    niveles[nivel].forEach(p => {
        const pared = document.createElement("div");
        pared.className = "pared";
        Object.assign(pared.style, {
            left: p.x + "%",
            top: p.y + "%",
            width: p.w + "%",
            height: p.h + "%"
        });
        laberinto.appendChild(pared);
    });
    x = 2;
    y = 2;
    actualizarJugador();
    mensaje.textContent = "Nivel " + nivel;
}

function actualizarJugador() {
    jugador.style.left = x + "%";
    jugador.style.top = y + "%";
}

function mover(dx, dy) {
    if (bloqueado) return;

    x += dx;
    y += dy;
    if (x < 0 || y < 0 || x > 95 || y > 95) return;

    actualizarJugador();

    if (colision(".pared")) {
        x = 2;
        y = 2;
        actualizarJugador();
    }

    if (colision("#meta")) pasarNivel();
}

/* MOVIMIENTO CONTINUO */
document.querySelectorAll("#controles button").forEach(btn => {
    btn.addEventListener("pointerdown", e => {
        e.preventDefault();
        if (intervalo) return;

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

function colision(selector) {
    const j = jugador.getBoundingClientRect();
    return [...document.querySelectorAll(selector)].some(el => {
        const r = el.getBoundingClientRect();
        return j.left < r.right && j.right > r.left &&
               j.top < r.bottom && j.bottom > r.top;
    });
}

function pasarNivel() {
    bloqueado = true;
    nivel++;
    if (nivel <= 3) {
        mensaje.textContent = "Nivel superado";
        setTimeout(() => {
            bloqueado = false;
            cargarNivel();
        }, 1000);
    } else {
        jumpscare.style.display = "block";
        video.play();
    }
}