const jugador = document.getElementById("jugador");
const meta = document.getElementById("meta");
const laberinto = document.getElementById("laberinto");
const barra = document.getElementById("barra");
const mensaje = document.getElementById("mensaje");

let nivel = 1;
let x = 10, y = 10;
let velocidad = 2;
let moviendo = {};
let bloqueo = false;

const niveles = {
    1: [
        {x: 100, y: 0, w: 20, h: 250, roja: false},
        {x: 180, y: 100, w: 20, h: 260, roja: true}
    ],
    2: [
        {x: 80, y: 0, w: 20, h: 300, roja: true},
        {x: 160, y: 60, w: 20, h: 300, roja: false}
    ],
    3: [
        {x: 120, y: 0, w: 20, h: 320, roja: true}
    ]
};

function cargarNivel() {
    laberinto.querySelectorAll(".pared").forEach(p => p.remove());
    barra.textContent = "Nivel " + nivel;
    mensaje.textContent = "";
    x = 10; y = 10;
    actualizar();

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

function actualizar() {
    jugador.style.left = x + "px";
    jugador.style.top = y + "px";
}

function colision(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function reiniciar() {
    mensaje.textContent = "Reiniciaste el nivel, no toques las paredes";
    x = 10; y = 10;
    actualizar();
}

function pasarNivel() {
    if (bloqueo) return;
    bloqueo = true;

    if (nivel < 3) {
        mensaje.textContent = "Pasaste al nivel " + (nivel + 1);
        setTimeout(() => {
            nivel++;
            cargarNivel();
            bloqueo = false;
        }, 1000);
    } else {
        document.getElementById("juego").classList.add("oculto");
        const f = document.getElementById("final");
        f.style.display = "block";
        document.getElementById("videoFinal").play();
    }
}

setInterval(() => {
    let prevX = x;
    let prevY = y;

    if (moviendo.up) y -= velocidad;
    if (moviendo.down) y += velocidad;
    if (moviendo.left) x -= velocidad;
    if (moviendo.right) x += velocidad;

    actualizar();

    laberinto.querySelectorAll(".pared").forEach(p => {
        if (colision(jugador.getBoundingClientRect(), p.getBoundingClientRect())) {
            reiniciar();
        }
    });

    if (colision(jugador.getBoundingClientRect(), meta.getBoundingClientRect())) {
        pasarNivel();
    }
}, 16);

/* CONTROLES */
document.querySelectorAll(".btn").forEach(btn => {
    const d = btn.dataset.dir;
    btn.onmousedown = () => moviendo[d] = true;
    btn.onmouseup = () => moviendo[d] = false;
    btn.ontouchstart = e => { e.preventDefault(); moviendo[d] = true; };
    btn.ontouchend = () => moviendo[d] = false;
});

/* TECLADO */
window.onkeydown = e => {
    if (e.key === "ArrowUp") moviendo.up = true;
    if (e.key === "ArrowDown") moviendo.down = true;
    if (e.key === "ArrowLeft") moviendo.left = true;
    if (e.key === "ArrowRight") moviendo.right = true;
};
window.onkeyup = e => {
    if (e.key === "ArrowUp") moviendo.up = false;
    if (e.key === "ArrowDown") moviendo.down = false;
    if (e.key === "ArrowLeft") moviendo.left = false;
    if (e.key === "ArrowRight") moviendo.right = false;
};

document.getElementById("btnIniciar").onclick = () => {
    document.getElementById("bienvenida").classList.add("oculto");
    document.getElementById("juego").classList.remove("oculto");
    cargarNivel();
};
