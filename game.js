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

/* DEFINICIÓN DE NIVELES */
const niveles = {
    1: [
        // NIVEL 1: 1 pared roja, 2 grises
        { x: 40, y: 20, w: 5, h: 60, roja: true },    // Pared roja vertical central
        { x: 20, y: 30, w: 15, h: 5, roja: false },   // Pared gris horizontal superior
        { x: 65, y: 60, w: 15, h: 5, roja: false }    // Pared gris horizontal inferior
    ],

    2: [
        // NIVEL 2: 2 paredes rojas, 1 gris
        { x: 30, y: 25, w: 5, h: 50, roja: true },    // Pared roja vertical izquierda
        { x: 60, y: 25, w: 5, h: 50, roja: true },    // Pared roja vertical derecha
        { x: 45, y: 40, w: 10, h: 5, roja: false }    // Pared gris central
    ],

    3: [
        // NIVEL 3: 3 paredes rojas - MÁS DIFÍCIL
        // Primera pared: acceso solo por ABAJO (deja espacio arriba)
        { x: 20, y: 30, w: 5, h: 55, roja: true },    // Pared 1: empieza al 30%, acceso por arriba
        
        // Segunda pared: acceso solo por ARRIBA (deja espacio abajo)
        { x: 45, y: 10, w: 5, h: 55, roja: true },    // Pared 2: empieza al 10%, acceso por abajo
        
        // Tercera pared: acceso solo por ABAJO (deja espacio arriba)
        { x: 70, y: 25, w: 5, h: 60, roja: true }     // Pared 3: empieza al 25%, acceso por arriba
    ]
};

const jugadorAncho = 5;
const jugadorAlto = 5;

btnInicio.onclick = () => {
    inicio.style.display = "none";
    bloqueado = false;
    cargarNivel();
};

function cargarNivel() {
    document.querySelectorAll(".pared-roja, .pared-gris").forEach(p => p.remove());

    niveles[nivel].forEach(p => {
        const pared = document.createElement("div");
        pared.className = p.roja ? "pared-roja" : "pared-gris";
        Object.assign(pared.style, {
            left: p.x + "%",
            top: p.y + "%",
            width: p.w + "%",
            height: p.h + "%",
            position: "absolute"
        });
        laberinto.appendChild(pared);
    });

    reposicionarMeta();
    
    reiniciarJugador();
    mensaje.textContent = "Nivel " + nivel;
    puedePasar = true;
}

function reposicionarMeta() {
    switch(nivel) {
        case 1:
            meta.style.left = "90%";
            meta.style.top = "90%";
            break;
        case 2:
            meta.style.left = "85%";
            meta.style.top = "85%";
            break;
        case 3:
            meta.style.left = "88%";
            meta.style.top = "50%";
            break;
    }
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

    const colisionRoja = hayColision(x, y, true);
    const colisionGris = hayColision(x, y, false);
    
    if (colisionRoja) {
        reinicioPorError();
    }
    
    if (colisionGris) {
        // Solo bloquea movimiento, no reinicia
        x -= dx;
        y -= dy;
        actualizarJugador();
    }

    if (puedePasar && colision("#meta")) {
        pasarNivel();
    }
}

function hayColision(posX, posY, soloRojas) {
    const jLeft = posX;
    const jRight = posX + jugadorAncho;
    const jTop = posY;
    const jBottom = posY + jugadorAlto;

    for (const pared of niveles[nivel]) {
        if (soloRojas && !pared.roja) continue;
        if (!soloRojas && pared.roja) continue;
        
        const pLeft = pared.x;
        const pRight = pared.x + pared.w;
        const pTop = pared.y;
        const pBottom = pared.y + pared.h;

        if (jLeft < pRight &&
            jRight > pLeft &&
            jTop < pBottom &&
            jBottom > pTop) {
            return true;
        }
    }
    
    return false;
}

function colision(selector) {
    const j = jugador.getBoundingClientRect();
    const m = meta.getBoundingClientRect();
    
    return !(j.right < m.left || 
             j.left > m.right || 
             j.bottom < m.top || 
             j.top > m.bottom);
}

function reinicioPorError() {
    mensaje.textContent = "¡Haz reiniciado el nivel, no toques las paredes rojas!";
    reiniciarJugador();
}

function pasarNivel() {
    puedePasar = false;
    bloqueado = true;
    
    // Texto en VERDE cuando pasa de nivel
    mensaje.style.color = "lime";
    
    nivel++;

    if (nivel <= 3) {
        mensaje.textContent = "Pasaste al nivel " + nivel;
        
        // Restaurar color rojo después de 1 segundo
        setTimeout(() => {
            mensaje.style.color = "red";
            bloqueado = false;
            cargarNivel();
        }, 1000);
    } else {
        // Nivel 3 completado - CAMBIO ESPECÍFICO QUE PEDISTE
        mensaje.textContent = "Cargando recompensa...";
        
        // Solo 1 segundo de espera (como pediste)
        setTimeout(() => {
            jumpscare.style.display = "block";
            video.muted = false;
            video.volume = 1.0;
            video.play().catch(e => {
                console.log("Error al reproducir video:", e);
                video.muted = false;
                video.play();
            });
            
            // Cuando termine el video, volver al inicio
            video.onended = function() {
                jumpscare.style.display = "none";
                video.currentTime = 0;
                video.muted = true;
                nivel = 1;
                inicio.style.display = "flex";
                bloqueado = true;
                mensaje.textContent = "¡Juego completado! Presiona 'Comenzar' para jugar otra vez";
                mensaje.style.color = "red"; // Restaurar color
            };
            
            // También permitir reinicio al tocar el video
            video.onclick = function() {
                jumpscare.style.display = "none";
                video.pause();
                video.currentTime = 0;
                video.muted = true;
                nivel = 1;
                inicio.style.display = "flex";
                bloqueado = true;
                mensaje.textContent = "¡Juego completado! Presiona 'Comenzar' para jugar otra vez";
                mensaje.style.color = "red"; // Restaurar color
            };
        }, 1000); // SOLO 1 SEGUNDO (como pediste)
    }
}

// Inicializar
video.muted = true;
video.loop = true;

mensaje.textContent = "Presiona 'Comenzar Juego' para iniciar";