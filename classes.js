class NPC {
    constructor({ position, image, text }) {
        this.position = position
        this.image = image
        this.text = text
        this.width = 50
        this.height = 50
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }

    interact() {
        c.font = '20px Arial';
        const textWidth = c.measureText(this.text).width; 
        const textHeight = 40; 

        c.fillStyle = 'white';
        c.fillRect(
            canvas.width / 2 - textWidth / 2 - 10,  
            canvas.height - textHeight - 20,        
            textWidth + 20,                         
            textHeight     
        );

        c.fillStyle = 'black';

        c.fillText(
            this.text, 
            canvas.width / 2 - textWidth / 2,  
            canvas.height - textHeight + 10   
        );
    }
}

class Monster {
    constructor({ position, image, frames = { max: 1, hold: 20 } }) {
        this.position = position;
        this.image = image;
        this.frames = { ...frames, valX: 0, valY: 0, elapsed: 0 };
        this.width = 48;
        this.height = 48;
        this.isAttacked = false; 

        this.velocity = {
            x: (Math.random() < 0.5 ? 1 : -1) * 0.5, 
            y: (Math.random() < 0.5 ? 1 : -1) * 0.5
        };

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height / this.frames.max;
        };
    }

    draw() {
        if (this.isAttacked) {
            return;
        }
        c.drawImage(
            this.image,
            this.frames.valX * this.width, 
            this.frames.valY * this.height, 
            this.image.width / this.frames.max, 
            this.image.height / this.frames.max, 
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );

        if (this.frames.max > 1) {
            this.frames.elapsed++;
            if (this.frames.elapsed % this.frames.hold === 0) {
                this.frames.valX = (this.frames.valX + 1) % this.frames.max;
            }
        }
    }

    die() {
        this.isAttacked = true;
    }

    update(boundaries) {
        if (this.isAttacked) {
            return;
        }
        const nextPosition = {
            x: this.position.x + this.velocity.x,
            y: this.position.y + this.velocity.y
        };
    
        let collided = false;
    
        for (let boundary of boundaries) {
            if (
                rectangularCollision({
                    rectangle1: { ...this, position: nextPosition },
                    rectangle2: boundary
                })
            ) {
                collided = true;
    
                if (this.velocity.x > 0) {
                    this.position.x = boundary.position.x - this.width - 1;
                } else if (this.velocity.x < 0) {
                    this.position.x = boundary.position.x + boundary.width + 1;
                }
    
                if (this.velocity.y > 0) {
                    this.position.y = boundary.position.y - this.height - 1;
                } else if (this.velocity.y < 0) {
                    this.position.y = boundary.position.y + boundary.height + 1;
                }
    
                this.velocity.x *= -1;
                this.velocity.y *= -1;
                break;
            }
        }
    
        if (!collided) {
            this.position.x = nextPosition.x;
            this.position.y = nextPosition.y;
        }
    
        if (this.position.x <= 0 || this.position.x + this.width >= canvas.width) {
            this.velocity.x *= -1;
            this.position.x = Math.max(0, Math.min(this.position.x, canvas.width - this.width));
        }
        if (this.position.y <= 0 || this.position.y + this.height >= canvas.height) {
            this.velocity.y *= -1;
            this.position.y = Math.max(0, Math.min(this.position.y, canvas.height - this.height));
        }
    }      
}

const Direction = {
    Up: 1,
    Down: 0,
    Left: 2,
    Right: 3
};

class Sprite {
    constructor({ position, velocity, image, frames = { max: 1} },  isAttacking = false) {
        this.position = position
        this.image = image
        this.frames = {...frames, valX: 0, valY: 0, elapsed: 0}
        this.isAttacking = isAttacking;

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height / this.frames.max
        }
        this.movingUp = false 
        this.movingDown = false 
        this.movingLeft = false 
        this.movingRight = false
        this.lastMoviment = Direction.Down
    }

    draw() {
        let weaponAngle = 0
        let xOffset = 0
        let yOffset = 0
        switch (this.lastMoviment) {
            case Direction.Up:
                weaponAngle = Math.PI
                xOffset = 15
                yOffset = -10
                break
            case Direction.Down:
                weaponAngle = 0
                xOffset = 20
                yOffset = 75
                break
            case Direction.Left:
                weaponAngle = Math.PI / 2
                xOffset = -10  
                yOffset = 48
                break
            case Direction.Right:
                weaponAngle = (Math.PI * 3) / 2
                xOffset = 73
                yOffset = 48
                break
        }

        if (this.isAttacking) {
            c.drawImage(
                attackImage,
                this.frames.valX * this.width,
                this.frames.valY * this.height,
                this.image.width / this.frames.max,
                this.image.height / this.frames.max,
                this.position.x,
                this.position.y,
                this.image.width / this.frames.max,
                this.image.height / this.frames.max
            );
            c.save()
            c.translate(this.position.x + xOffset, this.position.y + yOffset)
            c.rotate(weaponAngle)
            c.drawImage(weaponImage, -7, -12, 14, 24)
            c.restore()
        } else {
            c.drawImage(
                this.image,
                this.frames.valX * this.width,
                this.frames.valY * this.height,
                this.image.width / this.frames.max,
                this.image.height / this.frames.max,
                this.position.x,
                this.position.y,
                this.image.width / this.frames.max,
                this.image.height / this.frames.max
            )
        }

        if (this.isAttacking) {
            this.frames.valY = 0
            this.frames.valX = this.lastMoviment
        } else if (this.movingDown) {
            this.lastMoviment = Direction.Down
            if (this.frames.max > 1){
                this.frames.elapsed++
            }

            if (this.frames.elapsed % 10 === 0){
                if (this.frames.valY < this.frames.max - 1) {
                    this.frames.valY++
                    this.frames.valX = 0
                } else {
                    this.frames.valY = 0
                    this.frames.valX = 0
                }
            }
        } else if (this.movingUp) {
            this.lastMoviment = Direction.Up
            if (this.frames.max > 1){
                this.frames.elapsed++
            }

            if (this.frames.elapsed % 10 === 0){
                if (this.frames.valY < this.frames.max - 1) {
                    this.frames.valY++
                    this.frames.valX = 1
                } else {
                    this.frames.valY = 0
                    this.frames.valX = 1
                }
            }
        } else if (this.movingLeft) {
            this.lastMoviment = Direction.Left
            if (this.frames.max > 1){
                this.frames.elapsed++
            }

            if (this.frames.elapsed % 10 === 0){
                if (this.frames.valY < this.frames.max - 1) {
                    this.frames.valY++
                    this.frames.valX = 2
                } else {
                    this.frames.valY = 0
                    this.frames.valX = 2
                }
            }
        } else if (this.movingRight) {
            this.lastMoviment = Direction.Right
            if (this.frames.max > 1){
                this.frames.elapsed++
            }

            if (this.frames.elapsed % 10 === 0){
                if (this.frames.valY < this.frames.max - 1) {
                    this.frames.valY++
                    this.frames.valX = 3
                } else {
                    this.frames.valY = 0
                    this.frames.valX = 3
                }
            }
        }
    }

    attack() {
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;  
        }, 500);

        this.isAttacked = true

        setTimeout(() => {
            this.isAttacked = false; 
        }, 1000);  
    }
}

class Boundary {
    static width = 48
    static height = 48
    constructor({position}) {
        this.position = position
        this.width = 48 
        this.height = 48
    }

    draw() {
        c.fillStyle = 'rgba(255, 0, 0, 0.0)'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}