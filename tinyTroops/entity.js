class Entity {

    id = "";
    x = 0;
    y = 0;

    alive = true;

    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

}


export class Dot {

    centerX = 0;
    centerY = 0;
    size = 50;
    color = "#FF0000";

    lineWidth = 10;

    constructor(x, y, size, color) {
        this.centerX = x;
        this.centerY = y;
        this.size = size;
        this.color = color;
    }

    render(context) {

        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        context.beginPath();

        context.ellipse(this.centerX, this.centerY, this.size, this.size, 2 * Math.PI, 2 * Math.PI, false);
        // context.moveTo(this.x, this.y);
        // context.lineTo(
        //     this.x + Math.cos((this.orientation - 90) * Math.PI / 180) * lineLength,
        //     this.y + Math.sin((this.orientation - 90) * Math.PI / 180) * lineLength);
        context.stroke();

    }
}

export class Line {

    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;
    color = "#FF0000"
    lineWidth = 1;

    constructor(x1, y1, x2, y2, lineWidth, color) {
        this.startX = x1;
        this.startY = y1;
        this.endX = x2;
        this.endY = y2;
        this.color = color;
        this.lineWidth = lineWidth;
    }

    getLength() {
        let rawLength = Math.sqrt(
            Math.pow(this.startX - this.endX, 2) + Math.pow(this.startY - this.endY, 2));

        let length = Math.ceil(rawLength / 100);

        // Minimum length of 1
        if (length < 1) {
            length++
        }

        return length;
    }

    render(context) {
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;

        context.save();
        context.beginPath();
        context.moveTo(this.startX, this.startY);
        context.lineTo(this.endX, this.endY);
        context.stroke();
        context.restore();
    }


}

export class TextLabel {

    startX = 0;
    startY = 0;
    text = "";
    color = "#FF0000";

    lineWidth = 10;

    constructor(x, y, text, color) {
        this.startX = x;
        this.startY = y;
        this.text = text;
        this.color = color;
    }

    render(context) {
        context.strokeStyle = this.color;
        context.fillStyle = "#000000";
        context.lineWidth = 2.0;
        context.font = "24px sans-serif";
        context.strokeText(this.text, this.startX, this.startY);
    }
}

export class Soldier extends Entity {

    image = new Image();

    constructor(id, x, y) {
        super(id,x,y);
        this.image.src = "resources/guy_1.png";
    }

    /**
     * Returns the coordinates of this entity if the click was within this image's bounds;
     * 
     * @param {*} event 
     */
    isClicked(event) {

        if (event.x >= this.x - (this.image.width / 2) && event.x <= this.x + (this.image.width / 2)) {
            if (event.y >= this.y - (this.image.height / 2) && event.y <= this.y + (this.image.height / 2)) {
                return { x: this.x, y: this.y };
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    getCenteredCoords() {
        return {
            x: this.x, // + (this.image.width / 2),
            y: this.y // + (this.image.height / 2)
        }
    }

    updatePositionByDelta(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    // Draws CENTERED on x,y
    render(context) {
        context.save();
        context.translate(this.x, this.y);
        context.drawImage(this.image, -(this.image.width / 2), - (this.image.height / 2));
        context.restore();
    }
}

export class Helpless extends Entity {

    image = new Image();

    constructor(id, x, y) {
        super(id,x,y);
        this.image.src = "resources/helpless_1.png";
    }

    isClicked(event) {
        return null;
    }

    render(context) {
        context.save();
        context.translate(this.x, this.y);
        context.drawImage(this.image, -(this.image.width / 2), - (this.image.height / 2));
        context.restore();
    }
}

export class Blob extends Entity {

    imageAlive = new Image();
    imageDead = new Image();
    target = null;

    constructor(id, x, y) {
        super(id, x, y);
        this.imageAlive.src = "resources/blob_1.png";
        this.imageDead.src = "resources/blob_dead_1.png";
    }

    /**
     * Returns the coordinates of this entity if the click was within this image's bounds;
     */
    isClicked(event) {
        if (event.x >= this.x - (this.imageAlive.width / 2) && event.x <= this.x + (this.imageAlive.width / 2)) {
            if (event.y >= this.y - (this.imageAlive.height / 2) && event.y <= this.y + (this.imageAlive.height / 2)) {
                return { x: this.x, y: this.y };
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    getCenteredCoords() {
        return {
            x: this.x, // + (this.image.width / 2),
            y: this.y // + (this.image.height / 2)
        }
    }

    updatePositionByDelta(dx, dy) {
        this.x += dx;
        this.y += dy;
    }


    setTarget(target) {
        this.target = target;
        console.log("blob " + this.id + " now targets soldier " + this.target.id);
    }

    // Draws CENTERED on x,y
    render(context) {
        context.save();
        context.translate(this.x, this.y);
        var image;
        if (this.alive) {
            image = this.imageAlive;
        } else {
            image = this.imageDead;
        }
        context.drawImage(image, -(this.imageAlive.width / 2), - (this.imageAlive.height / 2));

        context.restore();
    }

}
