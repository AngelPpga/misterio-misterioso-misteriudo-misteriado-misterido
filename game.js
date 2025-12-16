let jugador = document.getElementById("jugador");
let meta = document.getElementById("meta");
let mensaje = document.getElementById("mensaje");
let jumpscare = document.getElementById("jumpscare");
let sonido = document.getElementById("sonido");

let x = 10;
let y = 10;
let nivel = 1;

document.addEventListener("keydown", mover);

function mover(e) {
    if (nivel > 3) return;

    if (e.key === "ArrowUp") y -= 10;
    if (e.key === "ArrowDown") y += 10;
    if (e.key === "ArrowLeft") x -= 10;
    if (e.key === "ArrowRight") x += 10;

    x = Math.max(0, Math.min(380, x));
    y = Math.max(0, Math.min(380, y));

    jugador.style.left = x + "px";
    jugador.style.top = y + "px";

    verificarMeta();
}

function verificarMeta() {
    let j = jugador.getBoundingClientRect();
    let m = meta.getBoundingClientRect();

    if (
        j.left < m.right &&
        j.right > m.left &&
        j.top < m.bottom &&
        j.bottom > m.top
    ) {
        pasarNivel();
    }
}

function pasarNivel() {
    nivel++;
    x = 10;
    y = 10;

    if (nivel <= 3) {
        mensaje.textContent = "Nivel " + nivel;
        alert("Pasaste al nivel " + nivel);
    } else {
        finalTerror();
    }
}

function finalTerror() {
    mensaje.textContent = "💀";
    jumpscare.style.display = "flex";
    sonido.play();
}