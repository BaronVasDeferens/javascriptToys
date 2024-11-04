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