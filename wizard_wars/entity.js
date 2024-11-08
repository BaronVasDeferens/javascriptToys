class Entity {

    id = "";
    x = 0;
    y = 0;

    isAlive = true;
    gridSquare = null;

    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

    update(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
    }

    render(context) {
        context.drawImage(this.image, this.x, this.y);
    }
}

export class Wizard extends Entity {
    constructor(id, x, y, image) {
        super(id, x, y);
        this.image = image;
    }
}

export class Monster extends Entity {
    constructor(id, x, y, image) {
        super(id, x, y);
        this.image = image;
    }

    setMover(mover) {
        this.mover = mover;
    }
}


export class Collectable extends Entity {
    isCollected = false;

    constructor(id, x, y, image) {
        super(id, x, y);
        this.image = image;
    }
}

export class Card extends Entity {

    width = 300;
    height = 340;

    constructor(x, y, action, image) {
        super(action, x, y);
        this.x = x;
        this.y = y;
        this.action = action;
        this.image = image;
    }

    containsClick(clickX, clickY) {
        return (clickX >= this.x && clickX <= this.x + this.width) && (clickY >= this.y && clickY <= this.y + this.height);
    }
}


export class Mover {
    constructor(entity, destinationX, destinationY, deltaX, deltaY, callback) {
        this.entity = entity;
        this.destinationX = destinationX;
        this.destinationY = destinationY;
        this.deltaX = deltaX;
        this.deltaY = deltaY;
        this.callback = callback;

        this.isAlive = true
    }

    update() {
        this.entity.update(this.deltaX, this.deltaY);
        if (this.entity.x == this.destinationX && this.entity.y == this.destinationY) {
            this.isAlive = false;
            this.callback();
        }
    }
}