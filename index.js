const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const collisionsMap = []
for (let i = 0; i < colisoes.length; i += 70) {
    collisionsMap.push(colisoes.slice(i, 70 + i))
}

const battleZoneMap = []
for (let i = 0; i < zonaDeBatalha.length; i += 70) {
    battleZoneMap.push(zonaDeBatalha.slice(i, 70 + i))
}

const boundaries = []

const offset = {
    x: -830,
    y: -1150
}

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
    })
})

const battleZones = []

battleZoneMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
    })
})

const image = new Image()
image.src = './img/mapa.png'

const foregroundImage = new Image()
foregroundImage.src = './img/primeiro-plano.png'

const playerImage = new Image()
playerImage.src = './img/Walk.png'

const monsterImage = new Image();
monsterImage.src = './img/dragon.png';

const monsterImage2 = new Image();
monsterImage2.src = './img/mushroom2.png';

const monsterImage3 = new Image();
monsterImage3.src = './img/bamboo.png';

const npcImage1 = new Image();
npcImage1.src = './img/Special2.png';

const npcImage2 = new Image();
npcImage2.src = './img/Special1 2.png';

const npcImage3 = new Image();
npcImage3.src = './img/Special1.png';

let playerHealth = 3;  
const heartImage = new Image();
heartImage.src = './img/heart.png';  

const weaponImage = new Image();
weaponImage.src = './img/sprite.png';

const attackImage = new Image();
attackImage.src = './img/Attack.png';


const monsters = [
    new Monster({ position: { x: 400, y: 300 }, image: monsterImage, frames: { max: 4, hold: 20 } }),
    new Monster({ position: { x: 600, y: 300 }, image: monsterImage2, frames: { max: 4, hold: 20 } }),
    new Monster({ position: { x: 800, y: 300 }, image: monsterImage3, frames: { max: 4, hold: 20 } })
];

const npc1 = new NPC({
    position: { x: 300, y: 400 }, 
    image: npcImage1,
    text: 'Olá, eu sou o Guardião do Bosque. Derrote todos monstros para vencer'
});

const npc2 = new NPC({
    position: { x: 600, y: 400 }, 
    image: npcImage2,
    text: 'Oi, sou o Macaco. Está perdido? Cuidado para os monstros não tocar em você'
});

const npc3 = new NPC({
    position: { x: 900, y: 400 }, 
    image: npcImage3,
    text: 'Ei, sou o Menino Cabeça de Ovo. Use sua faca para derrotar os monstros'
});

const player = new Sprite({
    position: {
        x: canvas.width / 2 - (256 / 4) / 2,
        y: canvas.height / 2 - (256 / 4) / 2
    },
    image: playerImage,
    frames: {
        max: 4
    }
})

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {     
        pressed: false
    },
    q: { pressed: false     
    } 
}

const movables = [background, ...boundaries, foreground, ...battleZones, ...monsters, npc1, npc2, npc3];
boundaries.push(npc1)
boundaries.push(npc2)
boundaries.push(npc3)

function drawHearts() {
    for (let i = 0; i < playerHealth; i++) {
        c.drawImage(heartImage, 20 + (i * 40), 20, 30, 30);  
    }
}

function rectangularCollision ({rectangle1, rectangle2 }) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x && 
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y
    )
}

function rectangularCollisionAtack ({rectangle1, rectangle2 }) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x - 50 && 
        rectangle1.position.x - 50 <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y - 50 <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y + 50
    )
}

function rectangularCollisionNPC ({rectangle1, rectangle2 }) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x - 30 && 
        rectangle1.position.x - 30 <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y - 30 <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y + 30
    )
}

let interactableNpc = null;

function checkNpcInteraction() {
    [npc1, npc2, npc3].forEach(npc => {
        if (rectangularCollisionNPC({
            rectangle1: player,
            rectangle2: npc
        })) {
            interactableNpc = npc;
        }
    });

    if (interactableNpc && keys.q.pressed) {
        interactableNpc.interact();
    }
}

let showMessage = false;  
let messageTimer = 0;  

function drawMessage() {
    if (showMessage) {
        const messageText = 'Perdeu uma vida!!!';
        
        const messageWidth = c.measureText(messageText).width + 40;  
        const messageHeight = 40;  

        c.fillStyle = 'white'; 
        c.fillRect(canvas.width / 2 - messageWidth / 2, canvas.height - messageHeight - 20, messageWidth, messageHeight); 

        c.font = '30px Arial';  
        c.fillStyle = 'red'; 

        const textX = canvas.width / 2 - messageWidth / 2 + 20;  
        const textY = canvas.height - messageHeight + 10;  
        c.fillText(messageText, textX, textY);  

        messageTimer--;
        if (messageTimer <= 0) {
            showMessage = false;
            messageTimer = 0;
        }
    }
}

let isHit = false;  
let hasWon = false

function checkMonsterCollision() {
    if (player.isAttacking) {
        monsters.forEach((monster, index) => {
            if (rectangularCollisionAtack({
                rectangle1: player,
                rectangle2: monster
            })) {
                monster.die();  
                ataque.Espada.play()
                monsters.splice(index, 1);  
            }
        });
    }
    monsters.forEach(monster => {
        if (rectangularCollision({
            rectangle1: player,
            rectangle2: monster
        }) && !player.isAttacking && !isHit) {  
            isHit = true; 
            playerHealth -= 1; 
            showMessage = true;
            messageTimer = 60;  
            audio2.Dano.play()

            if (playerHealth <= 0) {
                perdeu.Derrota.play()
                alert('Game Over! Você perdeu todos os corações.');
                location.reload();  
            }

            setTimeout(() => {
                isHit = false; 
            }, 1000); 
        }
    });

    if (monsters.length == 0 && !hasWon) {
        hasWon = true
        venceu.Vitoria.play()
        alert('Parabéns! Você venceu!');
        location.reload(); 
    }
}

function animateWalk() {
    window.requestAnimationFrame(animateWalk)
    background.draw()
    boundaries.forEach((boundary) => {
        boundary.draw()
    })
    battleZones.forEach(battleZone => {
        battleZone.draw()
    })
    monsters.forEach((monster) => {
        monster.update(boundaries);
        monster.draw(); 
    });
    player.draw();
    foreground.draw();
    drawHearts();  
    drawMessage(); 

    checkNpcInteraction();
    checkMonsterCollision();

    let moving = true;
    player.movingDown = false
    player.movingUp = false
    player.movingLeft = false
    player.movingRight = false
    if (keys.w.pressed && lastKey === 'w') {
        player.movingUp = true
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position : {
                            x: boundary.position.x,
                            y: boundary.position.y + 3
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }

        if (moving) {
            movables.forEach((movable) => {
                movable.position.y += 3
            })
        }
    } else if (keys.a.pressed && lastKey === 'a') {
        player.movingLeft = true
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position : {
                            x:boundary.position.x + 3,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }

        if (moving) {
            movables.forEach((movable) => {
                movable.position.x += 3
            })
        }
    } else if (keys.s.pressed && lastKey === 's') {
        player.movingDown = true
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position : {
                            x:boundary.position.x,
                            y: boundary.position.y - 3
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }

        if (moving) {
            movables.forEach((movable) => {
                movable.position.y -= 3
            })
        }
    } else if (keys.d.pressed && lastKey === 'd') {
        player.movingRight = true
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position : {
                            x:boundary.position.x - 3,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }

        if (moving) {
            movables.forEach((movable) => {
                movable.position.x -= 3
            })
        }
    }
}
animateWalk()

let lastKey = ''
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
        case 'q': 
            keys.q.pressed = true;
            break;
        case ' ':
            if (e.key === ' ') {
                player.attack();
            }       
    }
})

let clicked = false

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false
            if (!clicked) {
                audio.Map.play()
                clicked = true
            }
            break
        case 'a':
            keys.a.pressed = false
            if (!clicked) {
                audio.Map.play()
                clicked = true
            }
            break
        case 's':
            keys.s.pressed = false
            if (!clicked) {
                audio.Map.play()
                clicked = true
            }
            break
        case 'd':
            keys.d.pressed = false
            if (!clicked) {
                audio.Map.play()
                clicked = true
            }
            break
        case 'q':
            keys.q.pressed = false;
            break;
            
    }
})

addEventListener('click', () => {
    if (!clicked) {
        audio.Map.play()
        clicked = true
    }
})