const bienvenida = document.getElementById("bienvenida");
const juego = document.getElementById("juego");
const final = document.getElementById("final");

const jugador = document.getElementById("jugador");
const meta = document.getElementById("meta");
const laberinto = document.getElementById("laberinto");
const barra = document.getElementById("barra");
const mensaje = document.getElementById("mensaje");

let nivel = 1;
let x = 10, y = 10;
let velocidad = 2;
let mov = {};
let bloqueoNivel = false;

/* DEFINICIÓN DE NIVELES */
const niveles = {
  1: [
    { x: 120, y: 0, w: 20, h: 250, roja: false }
  ],
  2: [
    { x: 80, y: 0, w: 20, h: 300, roja: true },
    { x: 200, y: 100, w: 20, h: 300, roja: false }
  ],
  3: [
    { x: 140, y: 0, w: 20, h: 320, roja: true }
  ]
};

function cargarNivel() {
  laberinto.querySelectorAll(".pared").forEach(p => p.remove());
  barra.textContent = "Nivel " + nivel;
  mensaje.textContent = "";
  x = 10;
  y = 10;
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

function colision(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function reiniciar() {
  mensaje.textContent = "Reiniciaste el nivel, no toques las paredes";
  x = 10;
  y = 10;
  actualizarJugador();
}

function pasarNivel() {
  if (bloqueoNivel) return;
  bloqueoNivel = true;

  if (nivel < 3) {
    mensaje.textContent = "Pasaste al nivel " + (nivel + 1);
    setTimeout(() => {
      nivel++;
      cargarNivel();
      bloqueoNivel = false;
    }, 1000);
  } else {
    juego.classList.add("oculto");
    final.classList.remove("oculto");
  }
}

/* BUCLE PRINCIPAL */
setInterval(() => {
  if (mov.up) y -= velocidad;
  if (mov.down) y += velocidad;
  if (mov.left) x -= velocidad;
  if (mov.right) x += velocidad;

  actualizarJugador();

  laberinto.querySelectorAll(".pared").forEach(p => {
    if (colision(jugador.getBoundingClientRect(), p.getBoundingClientRect())) {
      reiniciar();
    }
  });

  if (colision(jugador.getBoundingClientRect(), meta.getBoundingClientRect())) {
    pasarNivel();
  }
}, 16);

/* CONTROLES TÁCTILES */
document.querySelectorAll(".btn").forEach(btn => {
  const d = btn.dataset.dir;
  btn.addEventListener("touchstart", e => { e.preventDefault(); mov[d] = true; });
  btn.addEventListener("touchend", () => mov[d] = false);
  btn.addEventListener("mousedown", () => mov[d] = true);
  btn.addEventListener("mouseup", () => mov[d] = false);
});

/* TECLADO */
window.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") mov.up = true;
  if (e.key === "ArrowDown") mov.down = true;
  if (e.key === "ArrowLeft") mov.left = true;
  if (e.key === "ArrowRight") mov.right = true;
});
window.addEventListener("keyup", e => {
  if (e.key === "ArrowUp") mov.up = false;
  if (e.key === "ArrowDown") mov.down = false;
  if (e.key === "ArrowLeft") mov.left = false;
  if (e.key === "ArrowRight") mov.right = false;
});

/* INICIO */
document.getElementById("btnIniciar").onclick = () => {
  bienvenida.classList.add("oculto");
  juego.classList.remove("oculto");
  nivel = 1;
  cargarNivel();
};