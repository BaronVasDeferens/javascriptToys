import { ImageAsset, SoundAsset } from './AssetLoader.js';

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
    size = 64;
    color = "#a8a8a8";

    isOccupied = false;
    isObstructed = false;


    constructor(x, y, size, color, imageModule) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.imageObstructed = imageModule.getImage(ImageAsset.FLOOR_OBSTRUCTION_1);      // THIS IS WASTEFUL! LOLOL
        this.imageClear = imageModule.getImage(ImageAsset.FLOOR_TILE);

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
            context.drawImage(this.imageObstructed, this.x * this.size, this.y * this.size);
        } else {
            context.drawImage(this.imageClear, this.x * this.size, this.y * this.size);
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
    isFilled = true;

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

        if (this.isFilled) {
            context.fill();
        }
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
        context.fillStyle = this.color;
        context.lineWidth = 2.0;
        context.font = "24px sans-serif";
        context.fillText(this.text, this.startX, this.startY);
    }
}

export class Weapon {

    name = "";
    rangeCostMap = {
        1: 1,
    };

    constructor(name, rangeCostMap) {
        this.name = name;
        this.rangeCostMap = rangeCostMap;
    }

    getApCostForRange(range) {
        return this.rangeCostMap[range];
    }

}

/**
 * SOLDIER
 */
export class Soldier extends Entity {

    imageWidth = 50;
    imageHeight = 50;

    weapon = new Weapon("SMG", {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5
    });

    currentFrameIndex = 0;
    maxFrameIndex = 3;
    currentTick = 0;
    maxTicks = 60;

    movementDrivers = new Array();

    constructor(id, x, y, imageLoader) {
        super(id, x, y);
        this.image = imageLoader.getImage(ImageAsset.SOLDIER_STRIP);
    }


    getApCostForRange(range) {
        return this.weapon.getApCostForRange(range);
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

/**
 * HELPLESS
 */

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

/**
 * BLOB
 */
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

    constructor(id, x, y, imageLoader) {
        super(id, x, y);
        this.imageAlive = imageLoader.getImage(ImageAsset.BLOB_STRIP);
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

    // left/rightvimages are 200x200
    // result images are 400x400

    ticks = 0;
    tickMax1 = 0;
    tickMax2 = 30;
    tickMax3 = 60;

    tickMax = 90;

    /**
     * {
     *      aggressor: entity,
     *      defender: entity,
     *      result: CombatResolution [KILL, STUN, NO_EFFECT]
     * }
     * 
     */

    constructor(columns, rows, gridSquareSize, attacker, defender, combatResult, imageLoader, soundLoader, onComplete) {

        this.x = (columns * gridSquareSize) / 2;
        this.y = (rows * gridSquareSize) / 2;
        this.attacker = attacker;
        this.defender = defender;
        this.combatResult = combatResult;
        this.onComplete = onComplete;

        this.isLive = true;

        if (this.attacker instanceof Soldier) {
            this.imageLeft = imageLoader.getImage(ImageAsset.SOLDIER_FIRING);
            this.imageRightA = imageLoader.getImage(ImageAsset.BLOB_SURVIVES);
            this.soundOne = soundLoader.getSound(SoundAsset.SMG_1);
        } else {
            this.imageLeft = imageLoader.getImage(ImageAsset.BLOB_ATTACKING);
            this.soundOne = soundLoader.getSound(SoundAsset.BLOB_WHIP);
        }

        if (this.defender instanceof Blob) {
            switch (combatResult.result) {
                case CombatResolutionState.KILL:
                    this.imageRightB = imageLoader.getImage(ImageAsset.BLOB_DYING);
                    this.imageCenter = imageLoader.getImage(ImageAsset.RESULT_BLOB_DEATH);
                    this.soundTwo = soundLoader.getSound(SoundAsset.BLOB_SMG_DEATH);
                    break;
                default:
                    this.imageRightB = imageLoader.getImage(ImageAsset.BLOB_SURVIVES);
                    this.imageCenter = imageLoader.getImage(ImageAsset.RESULT_SOLDIER_MISS);
                    this.soundTwo = soundLoader.getSound(SoundAsset.RICOCHET_1);
                    break;
            }
        } else {
            this.imageLeft = imageLoader.getImage(ImageAsset.BLOB_ATTACKING);
            switch (combatResult.result) {
                case CombatResolutionState.KILL:
                    this.imageRightB = imageLoader.getImage(ImageAsset.SOLDIER_DYING);
                    this.imageCenter = imageLoader.getImage(ImageAsset.RESULT_SOLDIER_DEATH);
                    this.soundTwo = soundLoader.getSound(SoundAsset.SOLDIER_SCREAM);
                    break;
                default:
                    // this.imageRight.src = "resources/blob_survives_1.png";
                    // this.imageCenter.src = "resources/result_miss.png"
                    break;
            }
        }
    }

    update() {
        this.ticks++;

        // FIXME: experimental hack
        if (this.defender.isAlive == false) {
            this.isLive = false;
        }

        if (this.isLive == false) {
            return;
        }
        if (this.ticks == 1) {
            this.soundOne.pause();
            this.soundOne.currentTime = 0;
            this.soundOne.play();
        }
        else if (this.ticks == this.tickMax2 && this.soundTwo != undefined) {
            this.soundTwo.pause();
            this.soundTwo.currentTime = 0;
            this.soundTwo.play();
        } else if (this.ticks == this.tickMax) {
            this.onComplete();
        }
    }

    isDone() {
        return this.ticks >= this.tickMax;
    }

    render(context) {

        if (this.isLive == false) {
            return;
        }

        let gapSize = 25;
        var image1X = this.x - 300;
        var image1Y = this.y - 100;

        if (this.ticks >= this.tickMax1) {
            context.drawImage(this.imageLeft, image1X, image1Y);
            if (this.imageRightA != undefined) {
                let image2X = image1X + 400;
                let image2Y = image1Y;
                context.drawImage(this.imageRightA, image2X, image2Y);
            }

        }

        if (this.ticks >= this.tickMax2) {
            let image2X = image1X + 400;
            let image2Y = image1Y;
            context.drawImage(this.imageRightB, image2X, image2Y);
        }

        if (this.ticks >= this.tickMax3) {
            let image3X = image1X + 100;
            let image3Y = image1Y - 100;
            context.drawImage(this.imageCenter, image3X, image3Y);
        }
    }
}

export class MovementAnimationDriver {

    deltaX = 0;
    deltaY = 0;

    currentTick = 0;
    maxTicks = 1;

    currentStep = 0;
    maxSteps = 20;

    constructor(entity, origin, destination, soundLoader) {
        this.entity = entity;
        this.destination = destination;

        if (entity instanceof Soldier) {
            this.sound = soundLoader.getSound(SoundAsset.SOLDIER_MOVE_1);
        } else {
            // Random blob sound
            if (Math.random() > 0.5) {
                this.sound = soundLoader.getSound(SoundAsset.BLOB_MOVE_1);
            } else {
                this.sound = soundLoader.getSound(SoundAsset.BLOB_MOVE_2);
            }
        }

        let destinationPos = destination.getOnScreenPos();
        let originScreenPos = origin.getOnScreenPos();

        this.deltaX = (destinationPos.x - originScreenPos.x) / this.maxSteps;
        this.deltaY = (destinationPos.y - originScreenPos.y) / this.maxSteps;
    }

    update() {

        if (this.currentStep == 0 && this.currentTick == 0) {
            this.sound.playbackRate = 1.20 - (Math.random() * 0.5);
            this.sound.pause();
            this.sound.currentTime = 0;
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

    imageWidth = 50;
    imageHeight = 50;

    currentTick = 0;
    ticksPerFrame = 5;

    currentFrame = 0;
    maxFrame = 7;

    x = 0;
    y = 0;

    constructor(gridSquare, imageModule) {
        this.image = imageModule.getImage(ImageAsset.BLOB_DEATH_STRIP);
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

export class BonusActionPointTile {
    value = 0;
    x = 0;
    y = 0;
    gridSquareSize = 50;
    color = "#0000FF";
    isAlive = true;

    textLabel = null;

    constructor(value, x, y, gridSquareSize) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.gridSquareSize = gridSquareSize;

        this.textLabel = new TextLabel(x * this.gridSquareSize + (this.gridSquareSize / 4), (y * this.gridSquareSize) + (this.gridSquareSize * 0.65), this.value, this.color);
    }

    update() {

    }

    isClicked(event) {
        return false;
    }

    render(context) {
        context.fillStyle = "#00FF00";
        // context.fillRect(this.x + (this.size / 4), this.y + (this.size / 4), this.size, this.size);
        this.textLabel.render(context);
    }

    collect() {
        this.isAlive = false;
    }
}

export class Animation {

    update() {

    }

    render(context) {

    }

    onDestroy() {

    }
}

/**
 * Intro animation
 * Designed as a Temporary Entity (disposed when INTRO state changes)
 * Shows the logo with a crazed "static" effect
 */
export class IntroAnimation {

    x = 0;
    y = 0;

    constructor(columns, rows, gridSsquareSize, imageModule, soundModule) {
        this.introImage = imageModule.getImage(ImageAsset.INTRO);
        this.x = ((columns / 2) * gridSsquareSize) - (this.introImage.width / 2);
        this.y = ((rows / 2) * gridSsquareSize) - (this.introImage.height / 2);
    }

    render(context) {

        context.drawImage(this.introImage, this.x, this.y);

        // context.fillStyle = "#000000";
        // for (var i = 0; i < 100; i++) {
        //     let startX = this.randomRange(this.x, this.introImage.width - 50);
        //     let startY = this.randomRange(this.y + 65, this.introImage.height - 175);
        //     let sizeX = Math.random() * 50;
        //     let sizeY = Math.random() * 50;
        //     context.fillRect(startX, startY, sizeX, sizeY);
        // }
    }

    randomRange(min, max) {
        return Math.floor(Math.random() * max) + min;
    }
}

export class VictoryAnimation {

    x = 0;
    y = 0;

    images = new Array();

    constructor(columns, rows, gridSsquareSize, imageLoader, soundLoader) {

        this.images.push(imageLoader.getImage(ImageAsset.VICTORY_1));

        this.x = ((columns / 2) * gridSsquareSize) - (this.images[0].width / 2);
        this.y = ((rows / 2) * gridSsquareSize) - (this.images[0].height / 2);
        //this.audio = soundLoader.getSound(SoundAsset.VICTORY_1);
        //this.audio.pause();
        //this.audio.currentTime = 0;
        //this.audio.play();
    }

    render(context) {
        context.drawImage(this.images[0], this.x, this.y);
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    onDestroy() {
        //this.audio.pause();
    }
}

export class DefeatAnimation {

    x = 0;
    y = 0;

    images = new Array();

    constructor(columns, rows, gridSsquareSize, imageLoader, soundLoader) {

        this.images.push(imageLoader.getImage(ImageAsset.DEFEAT_1));
        this.images.push(imageLoader.getImage(ImageAsset.DEFEAT_2));
        this.images.push(imageLoader.getImage(ImageAsset.DEFEAT_3));
        this.images.push(imageLoader.getImage(ImageAsset.DEFEAT_4));

        this.x = ((columns / 2) * gridSsquareSize) - (this.images[0].width / 2);
        this.y = ((rows / 2) * gridSsquareSize) - (this.images[0].height / 2);
        this.audio = soundLoader.getSound(SoundAsset.INTRO);
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.play();
    }

    render(context) {
        let index = this.getRandomInt(this.images.length);
        context.drawImage(this.images[index], this.x, this.y);
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    onDestroy() {
        this.audio.pause();
    }
}

export class TurnStartAnimationLeftToRight extends Animation {

    ticksCurrent = 0;

    constructor(columns, rows, gridSquareSize, imageLoader, assetId, onComplete) {
        super();

        this.image = imageLoader.getImage(assetId);
        this.startX = 0 - this.image.width;
        this.startY = ((rows * gridSquareSize) / 2) - (this.image.height / 2);
        this.endX = ((columns * gridSquareSize) / 2) - (this.image.width / 2);
        this.endY = this.startY;

        this.x = this.startX;
        this.y = this.startY;
        this.onComplete = onComplete;

        console.log(`LR startXY: ${this.startX}, ${this.startY}`);
        console.log(`LR endXY: ${this.endX}, ${this.endY}`);
    }

    update() {
        if (!this.isDone()) {
            this.ticksCurrent++;
            this.x = this.startX + (185 * (Math.log(this.ticksCurrent)));
            console.log(`LR tick: ${this.ticksCurrent} x: ${this.x}`);

        } else {
            this.onComplete();
        }
    }

    render(context) {
        this.update();
        context.globalAlpha = (this.currentTick) / 100.0;
        context.drawImage(this.image, this.x, this.y);
        context.globalAlpha = 1.0;
    }

    isDone() {
        return this.x >= this.endX;
    }

    onDestroy() {

    }

}

export class TurnStartAnimationRightToLeft extends Animation {

    ticksCurrent = 0;

    constructor(columns, rows, gridSquareSize, imageLoader, assetId, onComplete) {
        super();

        this.image = imageLoader.getImage(assetId);
        this.startX = (columns * gridSquareSize);
        this.startY = ((rows * gridSquareSize) / 2) - (this.image.height / 2);
        this.endX = ((columns * gridSquareSize) / 2) - (this.image.width / 2);
        this.endY = this.startY;

        this.x = this.startX;
        this.y = this.startY;
        this.onComplete = onComplete;

        console.log(`RL startXY: ${this.startX}, ${this.startY}`);
        console.log(`RL endXY: ${this.endX}, ${this.endY}`);
    }

    update() {
        if (!this.isDone()) {
            this.ticksCurrent++;
            this.x = this.startX - (185 * (Math.log(this.ticksCurrent)));
            console.log(`RL tick: ${this.ticksCurrent} x: ${this.x}`);
        } else {
            this.onComplete();
        }
    }

    render(context) {
        this.update();
        context.globalAlpha = (this.currentTick) / 100.0;
        context.drawImage(this.image, this.x, this.y);
        context.globalAlpha = 1.0;
    }

    isDone() {
        return this.x <= this.endX;
    }

    onDestroy() {

    }

}