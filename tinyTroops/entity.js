
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

    setGridSquare(gridSquare) {

        if (this.gridSquare != null) {
            this.gridSquare.isOccupied = false;
        }

        this.gridSquare = gridSquare;
        this.gridSquare.isOccupied = true;
    }

}

export class GridSquare {

    x = 0;
    y = 0;
    size = 50;
    color = "#a8a8a8";

    isOccupied = false;
    isObstructed = false;

    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        if (color != undefined) {
            this.color = color;
        }
    }

    setColor(color) {
        this.color = color;
    }

    containsPoint(x, y) {
        if (x > this.x && x < this.x + this.size) {
            if (y > this.y && y < this.y + this.size) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    getCenter() {
        let xCenter = (this.x * this.size) + (this.size / 2);
        let yCenter = (this.y * this.size) + (this.size / 2);
        return { x: xCenter, y: yCenter };
    }

    getOnScreenPos() {
        return {
            x: this.x * this.size,
            y: this.y * this.size,
            size: this.size
        };
    }

    render(context) {

        if (this.isObstructed) {
            context.fillStyle = "#000000";
            context.fillRect(this.x * this.size, this.y * this.size, this.size, this.size);
        } else {
            context.strokeStyle = this.color;
            context.lineWidth = 1.0;
            context.strokeRect(this.x * this.size, this.y * this.size, this.size, this.size);
            // Circle in the center
            // context.beginPath();
            // let center = this.getCenter();
            // context.ellipse(center.x, center.y, 5, 5, 2 * Math.PI, 2 * Math.PI, false);
            // context.stroke();
        }
    }
}

export class Dot {

    x = 0;
    y = 0;
    color = "#000000";
    isFilled = false;

    constructor(gridSquare, color, isFilled) {
        let centers = gridSquare.getCenter();
        this.x = centers.x;
        this.y = centers.y;
        this.color = color;
        if (isFilled != null) {
            this.isFilled = isFilled;
        } else {
            this.isFilled = false;
        }
    }

    render(context) {

        context.fillStyle = this.color;
        context.strokeStyle = this.color;

        context.lineWidth = 1.0;
        context.beginPath();
        context.ellipse(this.x, this.y, 5, 5, 2 * Math.PI, 2 * Math.PI, false);
        context.stroke();

        if (this.isFilled) {
            context.fill();
        }
    }

}

export class LittleDot {
    x = 0;
    y = 0;
    color = "#FFFF00";

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    render(context) {

        context.fillStyle = this.color;
        context.strokeStyle = this.color;

        context.lineWidth = 1.0;
        context.beginPath();
        context.ellipse(this.x, this.y, 2, 2, 2 * Math.PI, 2 * Math.PI, false);
        context.stroke();
    }

}

export class Ring {

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
        context.globalAlpha = 0.5;
        context.beginPath();
        context.ellipse(this.centerX, this.centerY, this.size, this.size, 2 * Math.PI, 2 * Math.PI, false);
        context.stroke();
        context.globalAlpha = 1.0;
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
        context.globalAlpha = 0.5;
        context.save();
        context.beginPath();
        context.moveTo(this.startX, this.startY);
        context.lineTo(this.endX, this.endY);
        context.stroke();
        context.restore();
        context.globalAlpha = 1.0;
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
/**
 * SOLDIER
 */
export class Soldier extends Entity {

    image = new Image();
    imageWidth = 50;
    imageHeight = 50;

    currentFrameIndex = 0;
    maxFrameIndex = 3;
    currentTick = 0;
    maxTicks = 60;

    movementDrivers = new Array();

    constructor(id, x, y) {
        super(id, x, y);
        this.image.src = "resources/guys_strip_2.png";
    }


    // Returns the coordinates of this entity if the click was within this image's bounds;
    isClicked(event) {
        if (event.x >= this.x - (this.imageWidth / 2) && event.x <= this.x + (this.imageWidth / 2)) {
            if (event.y >= this.y - (this.imageHeight / 2) && event.y <= this.y + (this.imageHeight / 2)) {
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
            x: this.x,
            y: this.y
        }
    }

    updatePositionByDelta(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    incrementFrame() {
        this.currentFrameIndex++;
        if (this.currentFrameIndex > this.maxFrameIndex) {
            this.currentFrameIndex = 0;
        }
    }

    update() {
        // Idle "wiggle" animation would go here
    }

    // Draws CENTERED on x,y
    render(context) {
        context.save();
        context.translate(this.x, this.y);
        context.drawImage(this.image, 50 * this.currentFrameIndex, 0, 50, 50, -(this.imageWidth / 2), - (this.imageHeight / 2), 50, 50);
        context.restore();
    }
}

export class Helpless extends Entity {

    image = new Image();

    constructor(id, x, y) {
        super(id, x, y);
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

    imageWidth = 50;
    imageHeight = 50;

    currentFrameIndex = 0;
    maxFrameIndex = 3;
    currentTick = 0;
    maxTicks = 30;

    movementDrivers = new Array();

    constructor(id, x, y) {
        super(id, x, y);
        this.imageAlive.src = "resources/blob_strip_2.png";
        this.imageDead.src = "resources/blob_dead_1.png";
    }

    /**
     * Returns the coordinates of this entity if the click was within this image's bounds;
     */
    isClicked(event) {
        if (event.x >= this.x - (this.imageWidth / 2) && event.x <= this.x + (this.imageWidth / 2)) {
            if (event.y >= this.y - (this.imageHeight / 2) && event.y <= this.y + (this.imageHeight / 2)) {
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
            x: this.x,
            y: this.y
        }
    }

    updatePositionByDelta(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    update() {
        this.currentTick++;
        if (this.currentTick >= this.maxTicks) {
            this.currentTick = 0;

            // Random frame
            this.currentFrameIndex = Math.floor(Math.random() * (this.maxFrameIndex + 1));
        }
    }

    incrementFrame() {
        this.currentFrameIndex++;
        if (this.currentFrameIndex > this.maxFrameIndex) {
            this.currentFrameIndex = 0;
        }
    }

    setTarget(target) {
        this.target = target;
        console.log("blob " + this.id + " now targets soldier " + this.target.id);
    }

    // Draws CENTERED on x,y
    render(context) {
        context.save();
        context.translate(this.x, this.y);

        if (this.isAlive) {
            context.drawImage(this.imageAlive, 50 * this.currentFrameIndex, 0, 50, 50, -(this.imageWidth / 2), - (this.imageHeight / 2), 50, 50);
        } else {
            context.drawImage(this.imageDead, -(this.imageDead.width / 2), - (this.imageDead.height / 2));
        }

        context.restore();
    }

}

export class CustomDriver {

    lamda = null;

    constructor(lamda) {
        this.lamda = lamda;
    }

    update() {
        this.lamda();
    }

    isDone() {
        return true;
    }
}

export var CombatResolutionState = Object.freeze({
    NO_EFFECT: "NO_EFFECT",
    STUN: "STUN",
    KILL: "KILL"
});

export class CombatResolutionDriver {

    soundOne = null;
    soundTwo = null;

    onComplete = null;

    image1 = new Image();
    image2 = new Image();
    image3 = new Image();


    ticks = 0;
    tickMax1 = 20;
    tickMax2 = 60;
    tickMax3 = 100;

    tickMax = 250;

    /**
     * {
     *      aggressor: entity,
     *      defender: entity,
     *      result: CombatResolution [KILL, STUN, NO_EFFECT]
     *      
     * }
     * 
     */

    constructor(combatResult, onComplete) {

        this.onComplete = onComplete;

        if (combatResult.attacker instanceof Soldier) {
            this.image1.src = "resources/soldier_focus_1.png";
            this.image2.src = "resources/soldier_smg_1.png";
            this.soundOne = new Audio("resources/smg.wav");
        } else {
            this.image1.src = "resources/soldier_death_panel_1.png";
            this.image2.src = "resources/soldier_death_panel_2.png";
            this.soundOne = new Audio("resources/blob_whip.wav");
        }

        if (combatResult.defender instanceof Blob) {
            switch (combatResult.result) {
                case CombatResolutionState.KILL:
                    this.image3.src = "resources/panel_3_blob_death.png";
                    this.soundTwo = new Audio("resources/blob_hit_smg.wav");
                    break;
                default:
                    this.image3.src = "resources/blob_survives_1.png";
                    break;
            }
        } else {
            this.image3.src = "resources/soldier_death_panel_3.png";
        }
    }

    update() {
        this.ticks++;

        if (this.ticks == this.tickMax2) {
            //this.sound.playbackRate = 1.20 - (Math.random() * 0.5);
            this.soundOne.play();
        } else if (this.ticks == this.tickMax3 && this.soundTwo != null) {
            this.soundTwo.play();
        } else if (this.ticks == this.tickMax) {
            this.onComplete();
        }
    }

    isDone() {
        return this.ticks >= this.tickMax;
    }

    render(context) {

        // images are 200x200

        if (this.ticks >= this.tickMax1) {
            context.drawImage(this.image1, 100, 100);
        }

        if (this.ticks >= this.tickMax2) {
            context.drawImage(this.image2, 350, 100);
        }

        if (this.ticks >= this.tickMax3) {
            context.drawImage(this.image3, 100, 350);
        }
    }
}

export class MovementAnimationDriver {

    deltaX = 0;
    deltaY = 0;

    sound = null;

    currentTick = 0;
    maxTicks = 2;

    currentStep = 0;
    maxSteps = 20;

    entity = null;
    destination = null;

    constructor(entity, origin, destination, sound) {
        this.entity = entity;
        this.destination = destination;
        this.sound = new Audio(sound);

        let destinationPos = destination.getOnScreenPos();
        let originScreenPos = origin.getOnScreenPos();

        this.deltaX = (destinationPos.x - originScreenPos.x) / this.maxSteps;
        this.deltaY = (destinationPos.y - originScreenPos.y) / this.maxSteps;
    }

    update() {

        if (this.currentStep == 0 && this.currentTick == 0) {
            this.sound.playbackRate = 1.20 - (Math.random() * 0.5);
            this.sound.play();
        }

        this.currentTick++;
        if (this.currentTick >= this.maxTicks) {
            this.currentTick = 0;
            this.currentStep++;
            this.entity.incrementFrame();
            this.entity.updatePositionByDelta(this.deltaX, this.deltaY);
        }
    }

    isDone() {
        return this.currentStep >= this.maxSteps;
    }

}

export class DeathAnimationDriver {

    image = new Image();

    imageWidth = 50;
    imageHeight = 50;

    currentTick = 0;
    ticksPerFrame = 15;

    currentFrame = 0;
    maxFrame = 7;

    x = 0;
    y = 0;

    constructor(gridSquare) {
        this.image.src = "resources/blob_death_strip.png";
        this.x = gridSquare.x;
        this.y = gridSquare.y;
    }

    update() {
        this.currentTick++;
        if (this.currentTick >= this.ticksPerFrame) {
            this.currentTick = 0;
            this.currentFrame++;
        }
    }

    render(context) {
        context.save();
        context.translate(this.x, this.y);
        context.drawImage(this.image, 50 * this.currentFrame, 0, 50, 50, -(this.imageWidth / 2), - (this.imageHeight / 2), 50, 50);
        context.restore();
    }

    isDone() {
        return (this.currentFrame >= this.maxFrame);
    }

}


/**
 * Intro animation
 * Designed as a Temporary Entity (disposed when INTRO state changes)
 * Shows the logo with a crazed "static" effect
 */
export class IntroAnimation {

    introImage = new Image();

    canvasWidth = 0;
    canvasHeight = 0;
    x = 0;
    y = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.introImage.src = "resources/logo.png";
    }

    render(context) {

        context.drawImage(this.introImage, this.x, this.y);

        context.fillStyle = "#000000";
        for (var i = 0; i < 100; i++) {
            let startX = this.randomRange(this.x, this.introImage.width - 50);
            let startY = this.randomRange(this.y, this.introImage.height - 50);
            let sizeX = Math.random() * 50;
            let sizeY = Math.random() * 50;
            context.fillRect(startX, startY, sizeX, sizeY);
        }
    }

    randomRange(min, max) {
        return Math.floor(Math.random() * max) + min;
    }
}